import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import { generateScheduleSchema, updateCellSchema } from "../../schemas/schedule.schema";
import makeDaySchedule from "../../util/schedule/makeDaySchedule";
import makeNightSchedule from "../../util/schedule/makeNightSchedule";
import changeSchedule from "../../util/schedule/changeSchedule";
import { buildScheduleState, computeAloneCount, computeDayWorkCount, computeNightWorkCount, getWeekdayCount } from "../../util/schedule/helpers";
import { ScheduleState } from "../../util/schedule/types";

const router = express.Router();

// GET /schedule/init - 스케줄 생성 전 초기 데이터
router.get("/init", async (req, res, next) => {
  const { groupId, date } = req.query as { groupId: string; date: string };

  if (!groupId || !date)
    return res.status(400).json({ error: "groupId와 date가 필요합니다." });

  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const targetWorkCount = getWeekdayCount(date);

    const selectedDay: number[] = [];
    const selectedNight: number[] = [];
    for (let i = 0; i < numDays; i++) {
      if ([5, 6].includes((firstWeekday + i) % 7)) selectedNight.push(i);
      if ((firstWeekday + i) % 7 === 6) selectedDay.push(i);
    }

    // 이전 스케줄 있으면 ShiftWorker, 없으면 그룹 멤버
    const prevSchedule = await prisma.schedule.findFirst({
      where: { groupId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { workers: { include: { user: { select: { userId: true, userName: true, userProfile: true } } } } },
    });

    let workers;

    if (prevSchedule?.workers.length) {
      workers = prevSchedule.workers.map((w) => ({
        userId: w.userId,
        userName: w.user.userName,
        userProfile: w.user.userProfile,
        isNight: w.isNight,
        targetWorkCount: w.targetWorkCount,
        admin: w.admin,
      }));
    } else {
      const group = await prisma.group.findFirst({
        where: { groupId, deletedAt: null },
        include: { members: { where: { deletedAt: null } } },
      });

      if (!group?.members.length)
        return res.status(400).json({ error: "그룹에 멤버가 없습니다." });

      workers = group.members.map((u) => ({
        userId: u.userId,
        userName: u.userName,
        userProfile: u.userProfile,
        isNight: false,
        targetWorkCount,
        admin: false,
      }));
    }

    res.json({
      data: {
        numDays,
        firstWeekday,
        targetWorkCount,
        selectedDay,
        selectedNight,
        workers,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /schedule - 스케줄 생성 + 자동 배치
router.post("/", validate(generateScheduleSchema), async (req, res, next) => {
  const { groupId, date, selectedDay, selectedNight, schedule: inputSchedule } = req.body;

  try {
    // 이전 스케줄에서 ShiftWorker 설정 불러오기, 없으면 그룹 멤버에서 fallback
    const prevSchedule = await prisma.schedule.findFirst({
      where: { groupId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { workers: true },
    });

    let shiftWorkerInputs;

    if (prevSchedule?.workers.length) {
      shiftWorkerInputs = prevSchedule.workers.map((w) => ({
        userId: w.userId,
        isNight: w.isNight,
        targetWorkCount: w.targetWorkCount,
        isNew: w.isNew,
        admin: w.admin,
      }));
    } else {
      // 최초 스케줄 생성 - 그룹 멤버에서 불러오기
      const group = await prisma.group.findFirst({
        where: { groupId, deletedAt: null },
        include: { members: { where: { deletedAt: null } } },
      });

      if (!group?.members.length) {
        return res.status(400).json({ error: "그룹에 멤버가 없습니다." });
      }

      const targetWorkCount = getWeekdayCount(date);

      shiftWorkerInputs = group.members.map((u) => ({
        userId: u.userId,
        isNight: false,
        targetWorkCount,
        isNew: false,
        admin: false,
      }));
    }

    // ScheduleState 구성
    const state = buildScheduleState({
      date,
      schedule: inputSchedule,
      selectedDay,
      selectedNight,
      shiftWorkers: shiftWorkerInputs,
    });

    // 자동 배치 실행
    Object.assign(state, makeDaySchedule(state));
    Object.assign(state, makeNightSchedule(state));

    // DB 저장
    const data = await prisma.schedule.create({
      data: {
        groupId,
        date,
        schedule: state.schedule,
        selectedDay,
        selectedNight,
        workers: {
          create: shiftWorkerInputs.map((w) => ({
            userId: w.userId,
            isNight: w.isNight,
            targetWorkCount: w.targetWorkCount,
            isNew: false,
            admin: w.admin,
          })),
        },
      },
      include: { workers: { include: { user: { select: { userId: true, userName: true, userProfile: true } } } } },
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
      include: { workers: { include: { user: { select: { userId: true, userName: true, userProfile: true } } } } },
    });
    if (!data) return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /schedule/:id/me - 내 스케줄 조회
router.get("/:id/me", async (req, res, next) => {
  const { id } = req.params;
  try {
    const schedule = await prisma.schedule.findFirst({
      where: { scheduleId: id, deletedAt: null },
      include: { workers: true },
    });
    if (!schedule) return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });

    const myWorkerIdx = schedule.workers.findIndex((w) => w.userId === req.user!.userId);
    if (myWorkerIdx === -1) return res.status(404).json({ error: "해당 스케줄에 포함되어 있지 않습니다." });

    const mySchedule = (schedule.schedule as number[][])[myWorkerIdx];
    res.json({ data: { schedule: mySchedule, worker: schedule.workers[myWorkerIdx] } });
  } catch (err) {
    next(err);
  }
});

// PATCH /schedule/:id/cell - 셀 수동 변경
router.patch("/:id/cell", validate(updateCellSchema), async (req, res, next) => {
  const { id } = req.params;
  const { emp, day, workType } = req.body;

  try {
    const existing = await prisma.schedule.findFirst({
      where: { scheduleId: id, deletedAt: null },
      include: { workers: true },
    });
    if (!existing) return res.status(404).json({ error: "스케줄을 찾을 수 없습니다." });

    const grid = existing.schedule as number[][];
    const d = new Date(existing.date);
    const numDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    const state: ScheduleState = {
      date: existing.date,
      weekday: new Date(existing.date).getDay(),
      numDays,
      group: 0,
      schedule: grid,
      selectedDay: existing.selectedDay as number[],
      selectedNight: existing.selectedNight as number[],
      worker: existing.workers.map((w, i) => ({
        name: w.userId,
        isNight: w.isNight,
        targetWorkCount: w.targetWorkCount,
        isNew: w.isNew,
        workCount: grid[i].filter((c) => [1, 2, 3, 4].includes(c)).length,
      })),
      aloneCount: computeAloneCount(grid, numDays),
      dayGroup: [0, 0, 0, 0],
      nightGroup: [0, 0, 0, 0],
      dayWorkCount: computeDayWorkCount(grid, numDays),
      nightWorkCount: computeNightWorkCount(grid, numDays),
    };

    const result = changeSchedule(state, emp, day, workType);

    const data = await prisma.schedule.update({
      where: { scheduleId: id },
      data: { schedule: result.schedule ?? grid },
    });

    res.json({ data });
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