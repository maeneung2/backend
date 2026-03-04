import express from "express";
import { userList } from "../../mockup/user";
import pool from "../../pool";

const router = express.Router();

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
