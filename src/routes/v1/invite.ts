import express from "express";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import { validate } from "../../middleware/validate";
import { sendInviteSchema } from "../../schemas/invite.schema";
import registry, { auth, body } from "../../docs/registry";
import { z } from "zod";

const router = express.Router();

const idParam = z.object({ id: z.string().uuid() });

registry.registerPath({
  method: "post",
  path: "/api/v1/invite",
  tags: ["Invite"],
  summary: "그룹 초대 발송 (owner만 가능)",
  ...auth,
  request: body(sendInviteSchema),
  responses: {
    201: { description: "초대 발송 성공" },
    400: { description: "이미 그룹에 속해있거나 대기 중인 초대가 존재" },
    403: { description: "권한 없음" },
    404: { description: "그룹 또는 유저 없음" },
  },
});
registry.registerPath({
  method: "get",
  path: "/api/v1/invite/received",
  tags: ["Invite"],
  summary: "내가 받은 초대 목록 조회",
  ...auth,
  responses: { 200: { description: "초대 목록" } },
});
registry.registerPath({
  method: "patch",
  path: "/api/v1/invite/{id}/accept",
  tags: ["Invite"],
  summary: "초대 수락",
  ...auth,
  request: { params: idParam },
  responses: {
    200: { description: "수락 성공" },
    400: { description: "이미 그룹에 속해있음" },
    403: { description: "본인 초대가 아님" },
    404: { description: "초대 없음" },
  },
});
registry.registerPath({
  method: "patch",
  path: "/api/v1/invite/{id}/reject",
  tags: ["Invite"],
  summary: "초대 거절",
  ...auth,
  request: { params: idParam },
  responses: {
    200: { description: "거절 성공" },
    403: { description: "본인 초대가 아님" },
    404: { description: "초대 없음" },
  },
});

// POST /invite — 초대 발송 (owner만)
router.post("/", validate(sendInviteSchema), async (req, res, next) => {
  const { groupId, id } = req.body;
  const myUserId = req.user!.userId;
  try {
    const group = await prisma.group.findFirst({
      where: { groupId, deletedAt: null },
    });
    if (!group)
      return res.status(404).json({ error: "그룹을 찾을 수 없습니다." });
    if (group.owner !== myUserId)
      return res.status(403).json({ error: "권한이 없습니다." });

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user)
      return res.status(404).json({ error: "유저를 찾을 수 없습니다." });
    if (user.groupId)
      return res.status(400).json({ error: "이미 그룹에 속해있는 유저입니다." });

    const userId = user.userId;
    const existing = await prisma.groupInvitation.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing && existing.status === "PENDING")
      return res.status(400).json({ error: "이미 초대가 발송된 유저입니다." });

    // 거절/취소된 이전 초대가 있으면 상태 초기화, 없으면 새로 생성
    const data = await prisma.$transaction(async (tx) => {
      const invite = existing
        ? await tx.groupInvitation.update({
            where: { groupId_userId: { groupId, userId } },
            data: { status: "PENDING" },
          })
        : await tx.groupInvitation.create({
            data: { groupId, userId },
          });

      await tx.notification.create({
        data: {
          userId,
          type: 1,
          content: `${group.groupName} 그룹에 초대되었습니다.`,
          data: {
            inviteId: invite.inviteId,
            groupId: group.groupId,
            groupName: group.groupName,
            groupProfile: group.groupProfile,
            status : invite.status,
          },
        },
      });

      return invite;
    });

    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /invite/received — 내가 받은 초대 목록 (PENDING)
router.get("/received", async (req, res, next) => {
  const myUserId = req.user!.userId;
  try {
    const data = await prisma.groupInvitation.findMany({
      where: { userId: myUserId, status: "PENDING" },
      include: {
        group: {
          select: { groupId: true, groupName: true, groupProfile: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// PATCH /invite/:id/accept — 초대 수락
router.patch("/:id/accept", async (req, res, next) => {
  const { id } = req.params;
  const myUserId = req.user!.userId;
  try {
    const invite = await prisma.groupInvitation.findFirst({
      where: { inviteId: id, status: "PENDING" },
    });
    if (!invite)
      return res.status(404).json({ error: "초대를 찾을 수 없습니다." });
    if (invite.userId !== myUserId)
      return res.status(403).json({ error: "권한이 없습니다." });

    const user = await prisma.user.findFirst({
      where: { userId: myUserId, deletedAt: null },
    });
    if (user?.groupId)
      return res.status(400).json({ error: "이미 그룹에 속해있습니다." });

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { userId: myUserId },
        data: { groupId: invite.groupId },
        select: { userId: true, userName: true, userProfile: true, groupId: true, admin: true },
      }),
      prisma.groupInvitation.update({
        where: { inviteId: id },
        data: { status: "ACCEPTED" },
      }),
      prisma.notification.updateMany({
        where: {
          userId: myUserId,
          type: 1,
          data: { path: ["inviteId"], equals: id },
        },
        data: { data: Prisma.DbNull },
      }),
    ]);

    res.json({ data: updatedUser });
  } catch (err) {
    next(err);
  }
});

// PATCH /invite/:id/reject — 초대 거절
router.patch("/:id/reject", async (req, res, next) => {
  const { id } = req.params;
  const myUserId = req.user!.userId;
  try {
    const invite = await prisma.groupInvitation.findFirst({
      where: { inviteId: id, status: "PENDING" },
    });
    if (!invite)
      return res.status(404).json({ error: "초대를 찾을 수 없습니다." });
    if (invite.userId !== myUserId)
      return res.status(403).json({ error: "권한이 없습니다." });

    const data = await prisma.$transaction([
      prisma.groupInvitation.update({
        where: { inviteId: id },
        data: { status: "REJECTED" },
      }),
      prisma.notification.updateMany({
        where: {
          userId: myUserId,
          type: 1,
          data: { path: ["inviteId"], equals: id },
        },
        data: { data: Prisma.DbNull },
      }),
    ]);

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;