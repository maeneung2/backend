import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import { createNoteSchema, updateNoteSchema } from "../../schemas/note.schema";
import registry, { auth, body } from "../../docs/registry";
import { z } from "zod";

const router = express.Router();

const idParam = z.object({ id: z.string().uuid() });

registry.registerPath({ method: "post", path: "/api/v1/note", tags: ["Note"], summary: "인수인계 생성",
  ...auth, request: body(createNoteSchema), responses: { 201: { description: "인수인계 생성 성공" } } });
registry.registerPath({ method: "get", path: "/api/v1/note/list", tags: ["Note"], summary: "인수인계 목록 조회",
  ...auth, request: { query: z.object({ groupId: z.string().uuid() }) }, responses: { 200: { description: "인수인계 목록" } } });
registry.registerPath({ method: "get", path: "/api/v1/note/{id}", tags: ["Note"], summary: "인수인계 단건 조회",
  ...auth, request: { params: idParam }, responses: { 200: { description: "인수인계 정보" }, 404: { description: "인수인계 없음" } } });
registry.registerPath({ method: "patch", path: "/api/v1/note/{id}", tags: ["Note"], summary: "인수인계 수정",
  ...auth, request: { params: idParam, ...body(updateNoteSchema) }, responses: { 200: { description: "수정 성공" }, 404: { description: "인수인계 없음" } } });
registry.registerPath({ method: "delete", path: "/api/v1/note/{id}", tags: ["Note"], summary: "인수인계 삭제",
  ...auth, request: { params: idParam }, responses: { 200: { description: "삭제 성공" } } });

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

// GET /note/list/by-date?date=YYYY-MM-DD - 특정 날짜 인수인계 목록 (내 그룹)
router.get("/list/by-date", async (req, res, next) => {
  const { date } = req.query as { date: string };
  const groupId = req.user!.groupId;

  if (!date)
    return res.status(400).json({ error: "date가 필요합니다." });
  if (!groupId)
    return res.status(400).json({ error: "그룹에 속해 있지 않습니다." });

  try {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const data = await prisma.note.findMany({
      where: {
        groupId,
        date: { gte: start, lte: end },
        deletedAt: null,
      },
      orderBy: { date: "asc" },
      include: {
        user: { select: { userId: true, userName: true, userProfile: true } },
      },
    });

    res.json({ data, total: data.length });
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
    if (existing.writer !== req.user!.userId)
      return res.status(403).json({ error: "권한이 없습니다." });

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
    const existing = await prisma.note.findFirst({ where: { noteId: id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: "인수인계를 찾을 수 없습니다." });
    if (existing.writer !== req.user!.userId)
      return res.status(403).json({ error: "권한이 없습니다." });

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