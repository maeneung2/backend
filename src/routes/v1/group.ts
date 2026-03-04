import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import {
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
} from "../../schemas/group.schema";
import registry, { auth, body } from "../../docs/registry";
import { z } from "zod";

const router = express.Router();

const idParam = z.object({ id: z.string().uuid() });

registry.registerPath({ method: "post", path: "/api/v1/group", tags: ["Group"], summary: "그룹 생성",
  ...auth, request: body(createGroupSchema), responses: { 201: { description: "그룹 생성 성공" } } });
registry.registerPath({ method: "get", path: "/api/v1/group/{id}", tags: ["Group"], summary: "그룹 조회",
  ...auth, request: { params: idParam }, responses: { 200: { description: "그룹 정보" }, 404: { description: "그룹 없음" } } });
registry.registerPath({ method: "patch", path: "/api/v1/group/{id}", tags: ["Group"], summary: "그룹 수정",
  ...auth, request: { params: idParam, ...body(updateGroupSchema) }, responses: { 200: { description: "수정 성공" }, 404: { description: "그룹 없음" } } });
registry.registerPath({ method: "post", path: "/api/v1/group/{id}/member", tags: ["Group"], summary: "멤버 추가",
  ...auth, request: { params: idParam, ...body(addMemberSchema) }, responses: { 200: { description: "멤버 추가 성공" }, 400: { description: "이미 그룹에 속한 유저" }, 404: { description: "그룹 또는 유저 없음" } } });
registry.registerPath({ method: "delete", path: "/api/v1/group/{id}/member/{userId}", tags: ["Group"], summary: "멤버 제거",
  ...auth, request: { params: z.object({ id: z.string().uuid(), userId: z.string().uuid() }) }, responses: { 200: { description: "멤버 제거 성공" }, 404: { description: "해당 그룹의 멤버가 아님" } } });
registry.registerPath({ method: "delete", path: "/api/v1/group/{id}", tags: ["Group"], summary: "그룹 삭제",
  ...auth, request: { params: idParam }, responses: { 200: { description: "그룹 삭제 성공" } } });

router.post("/", validate(createGroupSchema), async (req, res, next) => {
  const { groupName, groupProfile, scheduleId } = req.body;
  const owner = req.user!.userId;
  try {
    const data = await prisma.group.create({
      data: {
        groupName,
        groupProfile,
        owner,
        scheduleId,
        members: { connect: { userId: owner } },
      },
      include: { members: { select: { userId: true, userName: true } } },
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const data = await prisma.group.findFirst({
      where: { groupId: id, deletedAt: null },
      include: {
        members: {
          where: { deletedAt: null },
          select: { userId: true, userName: true, userProfile: true },
        },
      },
    });
    if (!data)
      return res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", validate(updateGroupSchema), async (req, res, next) => {
  const { id } = req.params;
  const { groupName, groupProfile } = req.body;
  try {
    const existing = await prisma.group.findFirst({
      where: { groupId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    if (existing.owner !== req.user!.userId)
      return res.status(403).json({ error: "권한이 없습니다." });

    const data = await prisma.group.update({
      where: { groupId: id },
      data: {
        groupName: groupName ?? undefined,
        groupProfile: groupProfile ?? undefined,
      },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/member", validate(addMemberSchema), async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const group = await prisma.group.findFirst({
      where: { groupId: id, deletedAt: null },
    });
    if (!group)
      return res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    if (group.owner !== req.user!.userId)
      return res.status(403).json({ error: "권한이 없습니다." });

    const user = await prisma.user.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!user)
      return res.status(404).json({ error: "유저를 찾을 수 없습니다." });

    if (user.groupId)
      return res.status(400).json({ error: "이미 그룹에 속해있는 유저입니다." });

    const data = await prisma.user.update({
      where: { userId },
      data: { groupId: id },
      select: { userId: true, userName: true },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/member/:userId", async (req, res, next) => {
  const { id, userId } = req.params;
  try {
    const group2 = await prisma.group.findFirst({ where: { groupId: id, deletedAt: null } });
    if (!group2) return res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    if (group2.owner !== req.user!.userId)
      return res.status(403).json({ error: "권한이 없습니다." });

    const user = await prisma.user.findFirst({
      where: { userId, groupId: id, deletedAt: null },
    });
    if (!user)
      return res.status(404).json({ error: "해당 그룹의 멤버가 아닙니다." });

    await prisma.user.update({
      where: { userId },
      data: { groupId: null },
    });
    res.json({ message: "멤버 제거 완료" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const group = await prisma.group.findFirst({ where: { groupId: id, deletedAt: null } });
    if (!group) return res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    if (group.owner !== req.user!.userId)
      return res.status(403).json({ error: "권한이 없습니다." });

    await prisma.group.updateMany({
      where: { groupId: id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "그룹 삭제 완료" });
  } catch (err) {
    next(err);
  }
});

export default router;