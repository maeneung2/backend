import express from "express";
import pool from "../../pool";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import generateJWTToken from "../../util/auth/generateJWTToken";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT user_id, id, user_name, group_id, phone, admin, created_at, password FROM "user" WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "등록되지 않은 번호이거나 비밀번호가 틀렸습니다." });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "등록되지 않은 번호이거나 비밀번호가 틀렸습니다." });
    }

    const { password: _pw, ...filterUser } = user;

    const accessToken = await generateJWTToken("access", filterUser);
    const refreshToken = await generateJWTToken("refresh", {
      userId: user.user_id,
    });

    await pool.query(
      `UPDATE "user" SET refresh_token = $1 WHERE user_id = $2 AND deleted_at IS NULL`,
      [refreshToken, filterUser.user_id],
    );

    // 4. 응답 전송 (민감한 정보인 password는 제외)
    res.status(200).json({
      message: "로그인 성공",
      accessToken: accessToken,
      refreshToken: refreshToken,
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

    const result = await pool.query(
      `INSERT INTO "user" (user_id, id, user_name, phone, password, refresh_token) 
       VALUES ($1, $2, $3, $4, $5 ,$6) RETURNING user_id, id, user_name, group_id, phone, admin, created_at`,
      [newUserId, id, userName, phone, hashedPassword, refreshToken],
    );

    const user = result.rows[0];

    const filterUser = {
      ...user,
      password: undefined,
      refresh_token: undefined,
    };

    const accessToken = await generateJWTToken("access", { ...filterUser });

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

    // 2. DB에 저장된 토큰과 일치하는지 확인 (가장 중요!)
    const result = await pool.query(
      'SELECT user_id, group_id FROM "user" WHERE user_id = $1 AND refresh_token = $2',
      [decoded.userId, refreshToken],
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "유효하지 않은 Refresh Token입니다." });
    }

    const newRefreshToken = await generateJWTToken("refresh", {
      userId: decoded.userId,
    });

    const user = result.rows[0];
    const filterUser = {
      ...user,
      password: undefined,
      refresh_token: undefined,
    };

    await pool.query(
      `UPDATE "user" SET refresh_token = $1 WHERE user_id = $2 AND deleted_at IS NULL`,
      [newRefreshToken, filterUser.user_id],
    );

    const newAccessToken = await generateJWTToken("access", { ...filterUser });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    // 토큰이 만료되었거나 변조된 경우
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
    await pool.query(
      `
      UPDATE "user" 
      SET refresh_token = NULL 
      WHERE refresh_token = $1
    `,
      [refreshToken],
    );

    res.status(200).json({
      message: "로그아웃 처리 완료",
    });
  } catch (err: any) {
    console.error("Logout Error:", err);
    return res
      .status(500)
      .json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
  }
});

export default router;
