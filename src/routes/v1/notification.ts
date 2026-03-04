import express from "express";
import prisma from "../../prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, type, content, url } = req.body;
  try {
    const data = await prisma.notification.create({
      data: { userId, type, content, url },
    });
    res.status(201).json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/list", async (req, res) => {
  const userId = (req as any).user.userId;
  try {
    const data = await prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    res.json({ page: 0, data, total: data.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.notification.findFirst({
      where: { notificationId: id, deletedAt: null },
    });
    if (!data)
      return res.status(404).json({ error: "알림을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.notification.findFirst({
      where: { notificationId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "알림을 찾을 수 없습니다." });

    const data = await prisma.notification.update({
      where: { notificationId: id },
      data: { read: true },
    });
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.updateMany({
      where: { notificationId: id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "알림 삭제 완료" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
