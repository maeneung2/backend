import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import {
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
} from "../../schemas/group.schema";

const router = express.Router();

router.post("/", validate(createGroupSchema), async (req, res, next) => {
  const { groupName, groupProfile, scheduleId } = req.body;
  const owner = req.user!.userId;
  try {
    const data = await prisma.group.create({
      data: {
        groupName,
        groupUsers: [owner],
        groupProfile,
        owner,
        scheduleId,
      },
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
      return res
        .status(404)
        .json({ error: "그룹을 찾을 수 없거나 이미 멤버입니다." });

    if (group.groupUsers.includes(userId))
      return res
        .status(400)
        .json({ error: "그룹을 찾을 수 없거나 이미 멤버입니다." });

    const data = await prisma.group.update({
      where: { groupId: id },
      data: { groupUsers: { push: userId } },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id/member/:userId", async (req, res, next) => {
  const { id, userId } = req.params;
  try {
    const group = await prisma.group.findFirst({
      where: { groupId: id, deletedAt: null },
    });
    if (!group)
      return res.status(404).json({ error: "그룹을 찾을 수 없습니다." });

    const data = await prisma.group.update({
      where: { groupId: id },
      data: { groupUsers: group.groupUsers.filter((u) => u !== userId) },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
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