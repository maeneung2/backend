import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import { generateScheduleSchema } from "../../schemas/schedule.schema";
import makeSingleSchedule from "../../util/schedule/makeSingleSchedule";
import makeNightSchedule from "../../util/schedule/makeNightSchedule";
import {
  buildScheduleState,
  getWeekdayCount,
  WorkerInput,
} from "../../util/schedule/helpers";

const router = express.Router();

// GET /schedule/init - 스케줄 생성 전 초기 데이터
router.get("/init", async (req, res, next) => {
  const { groupId, date } = req.query as { groupId: string; date: string };

  if (!groupId || !date)
    return res.status(400).json({ error: "groupId와 date가 필요합니다." });

  try {
    const yearMonth = (date as string).slice(0, 7);
    const existing = await prisma.schedule.findFirst({
      where: {
        groupId,
        date: { startsWith: yearMonth },
        deletedAt: null,
      },
    });
    if (existing)
      return res
        .status(409)
        .json({ error: "해당 월에 이미 스케줄이 존재합니다." });

    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const weekdayCount = getWeekdayCount(date);
    const restCount = numDays - weekdayCount;

    const selectedDay: number[] = [];
    const selectedNight: number[] = [];
    for (let i = 0; i < numDays; i++) {
      if ([5, 6].includes((firstWeekday + i) % 7)) selectedNight.push(i);
      if ((firstWeekday + i) % 7 === 6) selectedDay.push(i);
    }

    const group = await prisma.group.findFirst({
      where: { groupId, deletedAt: null },
      include: { members: { where: { deletedAt: null } } },
    });

    if (!group?.members.length)
      return res.status(400).json({ error: "그룹에 멤버가 없습니다." });

    const workers = group.members.map((u) => ({
      userId: u.userId,
      fixedWorkType: 0,
      isNew: false,
      restCount,
      plan: Array(numDays).fill(0),
      user: {
        userId: u.userId,
        userName: u.userName,
        userProfile: u.userProfile,
      },
    }));

    res.json({
      data: {
        numDays,
        firstWeekday,
        restCount,
        selectedDay,
        selectedNight,
        workers,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /schedule - 그룹 스케줄 목록 조회
router.get("/", async (req, res, next) => {
  const { groupId } = req.query as { groupId: string };

  if (!groupId) return res.status(400).json({ error: "groupId가 필요합니다." });

  try {
    const data = await prisma.schedule.findMany({
      where: { groupId, deletedAt: null },
      orderBy: { date: "desc" },
      select: {
        scheduleId: true,
        groupId: true,
        date: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// POST /schedule/preview - DB 저장 없이 스케줄 생성 결과만 반환
router.post("/preview", (req, res, next) => {
  const { groupId, date, selectedDay, selectedNight, workers } = req.body;

  try {
    const sorted = [
      ...(workers as WorkerInput[]).filter((w) => w.fixedWorkType !== 2),
      ...(workers as WorkerInput[]).filter((w) => w.fixedWorkType === 2),
    ];

    const d = new Date(date);
    const numDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const inputSchedule = sorted.map((w) =>
      w.plan?.length ? w.plan : new Array(numDays).fill(0),
    );

    const state = buildScheduleState({
      date,
      schedule: inputSchedule,
      selectedDay,
      selectedNight,
      workers: sorted,
    });

    Object.assign(state, makeSingleSchedule(state));
    Object.assign(state, makeNightSchedule(state));

    const workersWithPlan = sorted.map((w, i) => ({
      ...w,
      plan: state.schedule[i],
    }));

    res.json({
      data: {
        groupId,
        date,
        selectedDay,
        selectedNight,
        workers: workersWithPlan,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /schedule - 스케줄 생성
router.post("/", validate(generateScheduleSchema), async (req, res, next) => {
  const { groupId, date, workers } = req.body;

  try {
    const yearMonth = date.slice(0, 7);
    const existing = await prisma.schedule.findFirst({
      where: { groupId, date: { startsWith: yearMonth }, deletedAt: null },
    });
    if (existing)
      return res
        .status(409)
        .json({ error: "해당 월에 이미 스케줄이 존재합니다." });

    const data = await prisma.schedule.create({
      data: {
        groupId,
        date,
        selectedDay: [],
        selectedNight: [],
        workers: {
          create: (workers as WorkerInput[]).map((w) => ({
            userId: w.userId,
            fixedWorkType: w.fixedWorkType ?? 0,
            restCount: w.restCount,
            isNew: w.isNew,
            plan: w.plan ?? [],
          })),
        },
      },
      include: {
        workers: {
          include: {
            user: {
              select: { userId: true, userName: true, userProfile: true },
            },
          },
        },
      },
    });

    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /schedule/:id - 전체 스케줄 조회 (관리자용)
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const data = await prisma.schedule.findFirst({
      where: { scheduleId: id, deletedAt: null },
      include: {
        workers: {
          include: {
            user: {
              select: { userId: true, userName: true, userProfile: true },
            },
          },
        },
      },
    });
    if (!data)
      return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /schedule/:id/me - 내 스케줄 조회
router.get("/:id/me", async (req, res, next) => {
  const { id } = req.params;
  try {
    const worker = await prisma.worker.findFirst({
      where: { scheduleId: id, userId: req.user!.userId, deletedAt: null },
      include: {
        user: { select: { userId: true, userName: true, userProfile: true } },
      },
    });
    if (!worker)
      return res
        .status(404)
        .json({ error: "해당 스케줄에 포함되어 있지 않습니다." });

    res.json({ data: worker });
  } catch (err) {
    next(err);
  }
});

// PATCH /schedule/:id - 스케줄 수정 (worker별 plan만 수정 가능)
router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { workers } = req.body;

  try {
    const existing = await prisma.schedule.findFirst({
      where: { scheduleId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });

    await prisma.$transaction(
      (workers as { workerId: string; plan: number[] }[]).map((w) =>
        prisma.worker.update({
          where: { workerId: w.workerId },
          data: { plan: w.plan },
        }),
      ),
    );

    res.json({ message: "스케줄 수정 완료" });
  } catch (err) {
    next(err);
  }
});

// DELETE /schedule/:id
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
