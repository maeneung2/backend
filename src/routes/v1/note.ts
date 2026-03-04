import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import { createNoteSchema, updateNoteSchema } from "../../schemas/note.schema";

const router = express.Router();

router.post("/", validate(createNoteSchema), async (req, res, next) => {
  const { groupId, content, date } = req.body;
  const writer = req.user!.userId;
  try {
    const data = await prisma.note.create({
      data: { groupId, writer, content, date: new Date(date) },
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/list", async (req, res, next) => {
  const { groupId } = req.query;
  try {
    const data = await prisma.note.findMany({
      where: { groupId: groupId as string, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    res.json({ page: 0, data, total: data.length });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const data = await prisma.note.findFirst({
      where: { noteId: id, deletedAt: null },
    });
    if (!data)
      return res.status(404).json({ error: "인수인계를 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", validate(updateNoteSchema), async (req, res, next) => {
  const { id } = req.params;
  const { content, date } = req.body;
  try {
    const existing = await prisma.note.findFirst({
      where: { noteId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "인수인계를 찾을 수 없습니다." });

    const data = await prisma.note.update({
      where: { noteId: id },
      data: {
        content: content ?? undefined,
        date: date !== undefined ? new Date(date) : undefined,
      },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.note.updateMany({
      where: { noteId: id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "인수인계 삭제 완료" });
  } catch (err) {
    next(err);
  }
});

export default router;