import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import { updateUserSchema } from "../../schemas/user.schema";
import registry, { auth, body } from "../../docs/registry";
import { z } from "zod";

const router = express.Router();

const idParam = z.object({ id: z.string().uuid() });

registry.registerPath({
  method: "get",
  path: "/api/v1/user/me",
  tags: ["User"],
  summary: "내 정보 조회",
  ...auth,
  responses: { 200: { description: "내 정보" } },
});
registry.registerPath({
  method: "get",
  path: "/api/v1/user/list",
  tags: ["User"],
  summary: "유저 목록 조회",
  ...auth,
  responses: { 200: { description: "유저 목록" } },
});
registry.registerPath({
  method: "get",
  path: "/api/v1/user/{id}",
  tags: ["User"],
  summary: "유저 단건 조회",
  ...auth,
  request: { params: idParam },
  responses: {
    200: { description: "유저 정보" },
    404: { description: "유저 없음" },
  },
});
registry.registerPath({
  method: "patch",
  path: "/api/v1/user/{id}",
  tags: ["User"],
  summary: "유저 수정",
  ...auth,
  request: { params: idParam, ...body(updateUserSchema) },
  responses: {
    200: { description: "수정 성공" },
    404: { description: "유저 없음" },
  },
});
registry.registerPath({
  method: "delete",
  path: "/api/v1/user/{id}",
  tags: ["User"],
  summary: "유저 탈퇴",
  ...auth,
  request: { params: idParam },
  responses: {
    200: { description: "탈퇴 성공" },
    404: { description: "유저 없음" },
  },
});
registry.registerPath({
  method: "patch",
  path: "/api/v1/user/{id}/admin",
  tags: ["User"],
  summary: "관리자 설정 (owner 전용)",
  ...auth,
  request: { params: idParam },
  responses: {
    200: { description: "설정 성공" },
    403: { description: "권한 없음" },
    404: { description: "유저 없음" },
  },
});

router.get("/me", async (req, res, next) => {
  try {
    const data = await prisma.user.findFirst({
      where: { userId: req.user!.userId, deletedAt: null },
      select: {
        userId: true,
        userName: true,
        userProfile: true,
        groupId: true,
        phone: true,
        admin: true,
      },
    });
    if (!data)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/list", async (req, res, next) => {
  try {
    const data = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        userId: true,
        userName: true,
        groupId: true,
        phone: true,
        createdAt: true,
        admin: true,
      },
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
    const data = await prisma.user.findFirst({
      where: { userId: id, deletedAt: null },
      select: {
        userId: true,
        userName: true,
        groupId: true,
        createdAt: true,
        admin: true,
      },
    });
    if (!data)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", validate(updateUserSchema), async (req, res, next) => {
  const { id } = req.params;
  const { userName, groupId, phone, userProfile } = req.body;
  try {
    const existing = await prisma.user.findFirst({
      where: { userId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    if (req.user!.userId !== id)
      return res.status(403).json({ error: "권한이 없습니다." });

    const data = await prisma.user.update({
      where: { userId: id },
      data: {
        userName: userName ?? undefined,
        groupId: groupId ?? undefined,
        phone: phone ?? undefined,
        userProfile: userProfile !== undefined ? userProfile : undefined,
      },
      select: {
        userId: true,
        userName: true,
        userProfile: true,
        groupId: true,
        phone: true,
      },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// PATCH /user/:id/admin — 관리자 설정 (owner 전용)
router.patch("/:id/admin", async (req, res, next) => {
  const { id } = req.params;
  const { admin } = req.body;
  const groupId = req.user!.groupId;

  if (!groupId)
    return res.status(403).json({ error: "소속된 그룹이 없습니다." });

  try {
    const group = await prisma.group.findUnique({
      where: { groupId },
    });
    if (group?.owner !== req.user!.userId)
      return res.status(403).json({ error: "권한이 없습니다." });

    const target = await prisma.user.findFirst({
      where: { userId: id, deletedAt: null },
    });
    if (!target)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

    const data = await prisma.user.update({
      where: { userId: id },
      data: { admin: Boolean(admin) },
      select: { userId: true, userName: true, admin: true },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  if (req.user!.userId !== id)
    return res.status(403).json({ error: "권한이 없습니다." });
  try {
    const result = await prisma.user.updateMany({
      where: { userId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json({ message: "탈퇴 처리되었습니다." });
  } catch (err) {
    next(err);
  }
});

export default router;
