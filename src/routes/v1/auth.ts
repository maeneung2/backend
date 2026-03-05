import express from "express";
import prisma from "../../prisma";
import bcrypt from "bcrypt";
import generateJWTToken from "../../util/generateJWTToken";
import jwt from "jsonwebtoken";
import { validate } from "../../middleware/validate";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  logoutSchema,
} from "../../schemas/auth.schema";
import registry, { body } from "../../docs/registry";

const router = express.Router();

registry.registerPath({ method: "post", path: "/api/v1/auth/login", tags: ["Auth"], summary: "로그인",
  request: body(loginSchema), responses: { 200: { description: "로그인 성공" }, 401: { description: "인증 실패" } } });
registry.registerPath({ method: "post", path: "/api/v1/auth", tags: ["Auth"], summary: "회원가입",
  request: body(registerSchema), responses: { 201: { description: "회원가입 성공" } } });
registry.registerPath({ method: "post", path: "/api/v1/auth/refresh", tags: ["Auth"], summary: "토큰 갱신",
  request: body(refreshSchema), responses: { 200: { description: "토큰 갱신 성공" }, 401: { description: "유효하지 않은 토큰" } } });
registry.registerPath({ method: "post", path: "/api/v1/auth/logout", tags: ["Auth"], summary: "로그아웃",
  request: body(logoutSchema), responses: { 200: { description: "로그아웃 성공" } } });

router.post("/login", validate(loginSchema), async (req, res, next) => {
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

    if (!user.password) {
      return res
        .status(401)
        .json({ error: "소셜 로그인으로 가입된 계정입니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "등록되지 않은 번호이거나 비밀번호가 틀렸습니다." });
    }

    const { password: _pw, refreshToken: _rt, ...filterUser } = user;

    const accessToken = generateJWTToken("access", filterUser);
    const refreshToken = generateJWTToken("refresh", {
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
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(registerSchema), async (req, res, next) => {
  const { id, userName, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { id, userName, phone, password: hashedPassword },
    });

    const refreshToken = generateJWTToken("refresh", { userId: user.userId });

    await prisma.user.update({
      where: { userId: user.userId },
      data: { refreshToken },
    });

    const { password: _pw, refreshToken: _rt, ...filterUser } = user;

    const accessToken = generateJWTToken("access", filterUser);

    res.status(201).json({
      message: "회원가입 및 로그인 성공",
      accessToken,
      refreshToken,
      user: filterUser,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", validate(refreshSchema), async (req, res) => {
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

    const newRefreshToken = generateJWTToken("refresh", {
      userId: decoded.userId,
    });

    await prisma.user.update({
      where: { userId: decoded.userId },
      data: { refreshToken: newRefreshToken },
    });

    const newAccessToken = generateJWTToken("access", {
      userId: user.userId,
      groupId: user.groupId,
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (_err) {
    res
      .status(401)
      .json({ error: "Refresh Token이 만료되었습니다. 다시 로그인하세요." });
  }
});

router.post("/logout", validate(logoutSchema), async (req, res, next) => {
  const { refreshToken } = req.body;

  try {
    await prisma.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });

    res.status(200).json({ message: "로그아웃 처리 완료" });
  } catch (err) {
    next(err);
  }
});

export default router;
