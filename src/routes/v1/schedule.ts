import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import {
  createScheduleSchema,
  updateScheduleSchema,
} from "../../schemas/schedule.schema";

const router = express.Router();

router.post("/", validate(createScheduleSchema), async (req, res, next) => {
  const { schedule, groupId } = req.body;
  try {
    const data = await prisma.schedule.create({
      data: { schedule, groupId },
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const data = await prisma.schedule.findFirst({
      where: { scheduleId: id, deletedAt: null },
    });
    if (!data)
      return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", validate(updateScheduleSchema), async (req, res, next) => {
  const { id } = req.params;
  const { schedule } = req.body;
  try {
    const existing = await prisma.schedule.findFirst({
      where: { scheduleId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });

    const data = await prisma.schedule.update({
      where: { scheduleId: id },
      data: { schedule: schedule ?? undefined },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.schedule.updateMany({
      where: { scheduleId: id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "스케줄 삭제 완료" });
  } catch (err) {
    next(err);
  }
});

export default router;