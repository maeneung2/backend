import express from "express";
import prisma from "../../prisma";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import generateJWTToken from "../../util/auth/generateJWTToken";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "등록되지 않은 번호이거나 비밀번호가 틀렸습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "등록되지 않은 번호이거나 비밀번호가 틀렸습니다." });
    }

    const { password: _pw, refreshToken: _rt, ...filterUser } = user;

    const accessToken = await generateJWTToken("access", filterUser);
    const refreshToken = await generateJWTToken("refresh", {
      userId: user.userId,
    });

    await prisma.user.update({
      where: { userId: user.userId },
      data: { refreshToken },
    });

    res.status(200).json({
      message: "로그인 성공",
      accessToken,
      refreshToken,
      user: filterUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { id, userName, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = v4();

    const refreshToken = await generateJWTToken("refresh", {
      userId: newUserId,
    });

    const user = await prisma.user.create({
      data: {
        userId: newUserId,
        id,
        userName,
        phone,
        password: hashedPassword,
        refreshToken,
      },
    });

    const { password: _pw, refreshToken: _rt, ...filterUser } = user;

    const accessToken = await generateJWTToken("access", filterUser);

    res.status(201).json({
      message: "회원가입 및 로그인 성공",
      accessToken,
      refreshToken,
      user: filterUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh Token이 필요합니다." });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_TOKEN as string,
    ) as { userId: string };

    const user = await prisma.user.findFirst({
      where: { userId: decoded.userId, refreshToken },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: "유효하지 않은 Refresh Token입니다." });
    }

    const newRefreshToken = await generateJWTToken("refresh", {
      userId: decoded.userId,
    });

    await prisma.user.update({
      where: { userId: decoded.userId },
      data: { refreshToken: newRefreshToken },
    });

    const newAccessToken = await generateJWTToken("access", {
      userId: user.userId,
      groupId: user.groupId,
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res
      .status(401)
      .json({ error: "Refresh Token이 만료되었습니다. 다시 로그인하세요." });
  }
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "이미 로그아웃 상태입니다." });
  }

  try {
    await prisma.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });

    res.status(200).json({ message: "로그아웃 처리 완료" });
  } catch (err: any) {
    console.error("Logout Error:", err);
    return res
      .status(500)
      .json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
  }
});

export default router;
