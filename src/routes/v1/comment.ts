import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../../schemas/comment.schema";
import registry, { auth, body } from "../../docs/registry";
import { z } from "zod";

const router = express.Router();

const groupAndIdParam = z.object({ groupId: z.string().uuid(), id: z.string().uuid() });

registry.registerPath({ method: "post", path: "/api/v1/comment", tags: ["Comment"], summary: "댓글 생성",
  ...auth, request: body(createCommentSchema), responses: { 201: { description: "댓글 생성 성공" } } });
registry.registerPath({ method: "get", path: "/api/v1/comment/{groupId}/list", tags: ["Comment"], summary: "댓글 목록 조회",
  ...auth, request: { params: z.object({ groupId: z.string().uuid() }), query: z.object({ noticeId: z.string().uuid() }) }, responses: { 200: { description: "댓글 목록" } } });
registry.registerPath({ method: "get", path: "/api/v1/comment/{groupId}/{id}", tags: ["Comment"], summary: "댓글 단건 조회",
  ...auth, request: { params: groupAndIdParam }, responses: { 200: { description: "댓글 정보" }, 404: { description: "댓글 없음" } } });
registry.registerPath({ method: "patch", path: "/api/v1/comment/{groupId}/{id}", tags: ["Comment"], summary: "댓글 수정",
  ...auth, request: { params: groupAndIdParam, ...body(updateCommentSchema) }, responses: { 200: { description: "수정 성공" }, 404: { description: "댓글 없음" } } });
registry.registerPath({ method: "delete", path: "/api/v1/comment/{groupId}/{id}", tags: ["Comment"], summary: "댓글 삭제",
  ...auth, request: { params: groupAndIdParam }, responses: { 200: { description: "삭제 성공" } } });

router.post("/", validate(createCommentSchema), async (req, res, next) => {
  const { groupId, noticeId, targetCommentId, content } = req.body;
  const writer = req.user!.userId;
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
  } catch (err) {
    next(err);
  }
});

router.get("/:groupId/list", async (req, res, next) => {
  const { groupId } = req.params;
  const { noticeId } = req.query;
  try {
    const data = await prisma.comment.findMany({
      where: { groupId, noticeId: noticeId as string, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
    res.json({ page: 0, data, total: data.length });
  } catch (err) {
    next(err);
  }
});

router.get("/:groupId/:id", async (req, res, next) => {
  const { groupId, id } = req.params;
  try {
    const data = await prisma.comment.findFirst({
      where: { commentId: id, groupId, deletedAt: null },
    });
    if (!data)
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:groupId/:id", validate(updateCommentSchema), async (req, res, next) => {
  const { groupId, id } = req.params;
  const { content } = req.body;
  try {
    const existing = await prisma.comment.findFirst({
      where: { commentId: id, groupId, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    if (existing.writer !== req.user!.userId && !req.user!.admin)
      return res.status(403).json({ error: "권한이 없습니다." });

    const data = await prisma.comment.update({
      where: { commentId: id },
      data: { content: content ?? undefined },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:groupId/:id", async (req, res, next) => {
  const { groupId, id } = req.params;
  try {
    const existing = await prisma.comment.findFirst({ where: { commentId: id, groupId, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    if (existing.writer !== req.user!.userId && !req.user!.admin)
      return res.status(403).json({ error: "권한이 없습니다." });

    await prisma.comment.updateMany({
      where: { commentId: id, groupId },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "댓글 삭제 완료" });
  } catch (err) {
    next(err);
  }
});

export default router;