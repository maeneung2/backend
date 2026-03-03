import express from "express";
import { userList } from "../../mockup/user";
import pool from "../../pool";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import generateJWTToken from "../../util/generateJWTToken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT * FROM "user" WHERE user_id = $1 AND deleted_at IS NULL',
      [id],
    );

    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "등록되지 않은 번호이거나 비밀번호가 틀렸습니다." });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "등록되지 않은 번호이거나 비밀번호가 틀렸습니다." });
    }

    // 4. 응답 전송 (민감한 정보인 password는 제외)
    res.json({
      message: "로그인 성공",
      accessToken: await generateJWTToken(user.user_id, user.user_name),
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        group_id: user.group_id,
        admin: user.admin,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { userName, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = v4();

    await pool.query(
      `INSERT INTO "user" (user_id, user_name, phone, password) 
       VALUES ($1, $2, $3, $4) RETURNING user_id, user_name`,
      [newUserId, userName, phone, hashedPassword],
    );

    res.status(201).json({
      message: "회원가입 및 로그인 성공",
      accessToken: generateJWTToken(newUserId, userName),
      user: {
        user_id: newUserId,
        user_name: userName,
        phone: phone,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE "user" SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [id],
    );
    res.json({ message: "탈퇴 처리되었습니다." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/list", async (req, res) => {
  res.send({ page: 0, data: userList, total: userList.length });
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;

  const { userName, groupId, phone, admin } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "user" SET user_name = COALESCE($1, user_name), group_id = COALESCE($2, group_id), phone = COALESCE($2, phone), admin = COALESCE($4, admin) WHERE user_id = $5 RETURNING *',
      [userName, groupId, phone, admin, id],
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT user_id, user_name, group_id, admin FROM "user" WHERE user_id = $1 AND deleted_at IS NULL',
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).send("사용자를 찾을 수 없습니다.");
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
