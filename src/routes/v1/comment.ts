import express from "express";
import { commentList, defaultComment } from "../../mockup/comment";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send({ message: `댓글 생성` });
});

router.delete("/:groupId/:id", async (req, res) => {
  res.send({ message: `${req.params.id} 댓글 삭제` });
});

router.get("/:groupId/list", async (req, res) => {
  res.send({ page: 0, data: commentList, total: commentList.length });
});

router.get("/:groupId/:id", async (req, res) => {
  res.send({ data: defaultComment });
});

export default router;
