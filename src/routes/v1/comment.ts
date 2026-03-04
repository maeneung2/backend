import express from "express";
import prisma from "../../prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  const { groupId, noticeId, targetCommentId, content } = req.body;
  const writer = (req as any).user.userId;
  try {
    const data = await prisma.comment.create({
      data: {
        groupId,
        writer,
        noticeId,
        targetCommentId: targetCommentId ?? null,
        content,
      },
    });
    res.status(201).json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:groupId/list", async (req, res) => {
  const { groupId } = req.params;
  const { noticeId } = req.query;
  try {
    const data = await prisma.comment.findMany({
      where: { groupId, noticeId: noticeId as string, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
    res.json({ page: 0, data, total: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:groupId/:id", async (req, res) => {
  const { groupId, id } = req.params;
  try {
    const data = await prisma.comment.findFirst({
      where: { commentId: id, groupId, deletedAt: null },
    });
    if (!data)
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:groupId/:id", async (req, res) => {
  const { groupId, id } = req.params;
  const { content } = req.body;
  try {
    const existing = await prisma.comment.findFirst({
      where: { commentId: id, groupId, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });

    const data = await prisma.comment.update({
      where: { commentId: id },
      data: { content: content ?? undefined },
    });
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:groupId/:id", async (req, res) => {
  const { groupId, id } = req.params;
  try {
    await prisma.comment.updateMany({
      where: { commentId: id, groupId },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "댓글 삭제 완료" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
