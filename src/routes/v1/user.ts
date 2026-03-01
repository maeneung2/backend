import express from "express";
import { defaultUser, userList } from "../../mockup/user";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send({ message: `유저 생성` });
});

router.delete("/:id", async (req, res) => {
  res.send({ message: `${req.params.id} 스케줄 삭제` });
});

router.get("/list", async (req, res) => {
  res.send({ page: 0, data: userList });
});

router.get("/:id", async (req, res) => {
  res.send({ data: defaultUser });
});

export default router;
