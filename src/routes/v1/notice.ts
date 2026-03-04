import express from "express";
import prisma from "../../prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  const { groupId, title, content, image } = req.body;
  const writer = (req as any).user.userId;
  try {
    const data = await prisma.notice.create({
      data: { title, content, image: image ?? [], groupId, writer },
    });
    res.status(201).json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:groupId/list", async (req, res) => {
  const { groupId } = req.params;
  try {
    const data = await prisma.notice.findMany({
      where: { groupId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    res.json({ page: 0, data, total: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:groupId/:id", async (req, res) => {
  const { groupId, id } = req.params;
  try {
    const data = await prisma.notice.findFirst({
      where: { noticeId: id, groupId, deletedAt: null },
    });
    if (!data)
      return res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:groupId/:id", async (req, res) => {
  const { groupId, id } = req.params;
  const { title, content, image } = req.body;
  try {
    const existing = await prisma.notice.findFirst({
      where: { noticeId: id, groupId, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });

    const data = await prisma.notice.update({
      where: { noticeId: id },
      data: {
        title: title ?? undefined,
        content: content ?? undefined,
        image: image ?? undefined,
      },
    });
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:groupId/:id", async (req, res) => {
  const { groupId, id } = req.params;
  try {
    await prisma.notice.updateMany({
      where: { noticeId: id, groupId },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "공지사항 삭제 완료" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
