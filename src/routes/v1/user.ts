import express from "express";
import prisma from "../../prisma";

const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        userId: true,
        userName: true,
        groupId: true,
        phone: true,
        admin: true,
        createdAt: true,
      },
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
    const data = await prisma.user.findFirst({
      where: { userId: id, deletedAt: null },
      select: { userId: true, userName: true, groupId: true, admin: true },
    });
    if (!data)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { userName, groupId, phone, admin } = req.body;
  try {
    const existing = await prisma.user.findFirst({
      where: { userId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

    const data = await prisma.user.update({
      where: { userId: id },
      data: {
        userName: userName ?? undefined,
        groupId: groupId ?? undefined,
        phone: phone ?? undefined,
        admin: admin ?? undefined,
      },
      select: {
        userId: true,
        userName: true,
        groupId: true,
        phone: true,
        admin: true,
      },
    });
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.user.updateMany({
      where: { userId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json({ message: "탈퇴 처리되었습니다." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
