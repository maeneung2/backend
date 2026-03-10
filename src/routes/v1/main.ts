import express from "express";
import prisma from "../../prisma";
import registry, { auth } from "../../docs/registry";

const router = express.Router();

registry.registerPath({
  method: "get",
  path: "/api/v1/main",
  tags: ["Main"],
  summary: "오늘 근무자 + 오늘 인수인계",
  ...auth,
  responses: {
    200: { description: "오늘 근무자, 오늘 인수인계" },
    404: { description: "그룹 없음" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/main/schedule",
  tags: ["Main"],
  summary: "내 스케줄 조회 (월별)",
  ...auth,
  responses: {
    200: { description: "해당 월 내 스케줄" },
    404: { description: "그룹 없음" },
  },
});

// GET /main — 오늘 근무자 + 오늘 인수인계
router.get("/", async (req, res, next) => {
  const { date } = req.query as { date?: string };
  const groupId = req.user!.groupId;

  if (!groupId) {
    const hasUnreadNotification = await prisma.notification
      .count({ where: { userId: req.user!.userId, read: false, deletedAt: null } })
      .then((count) => count > 0);
    return res.json({ data: { group: null, todayWorkers: null, todayNotes: null, hasUnreadNotification } });
  }

  try {
    const now = date ? new Date(date) : new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const todayIndex = now.getDate() - 1;

    const group = await prisma.group.findUnique({
      where: { groupId },
      select: { groupId: true, groupName: true, groupProfile: true },
    });

    const rawSchedule = await prisma.schedule.findFirst({
      where: { groupId, date: { startsWith: yearMonth }, deletedAt: null },
      include: {
        workers: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: { userId: true, userName: true, userProfile: true },
            },
          },
        },
      },
    });

    // 오늘의 근무자 (주간: 1, 야간: 2)
    const todayWorkers: { day: object[]; night: object[] } = {
      day: [],
      night: [],
    };
    if (rawSchedule) {
      const grid = rawSchedule.schedule as number[][];
      rawSchedule.workers.forEach((worker, idx) => {
        const cell = grid[idx]?.[todayIndex];
        if (cell === 1) todayWorkers.day.push(worker.user);
        else if (cell === 2) todayWorkers.night.push(worker.user);
      });
    }

    // 오늘의 인수인계
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const [todayNotes, hasUnreadNotification] = await Promise.all([
      prisma.note.findMany({
        where: { groupId, date: { gte: start, lte: end }, deletedAt: null },
        orderBy: { date: "asc" },
        include: {
          user: { select: { userId: true, userName: true, userProfile: true } },
        },
      }),
      prisma.notification.count({
        where: { userId: req.user!.userId, read: false, deletedAt: null },
      }).then((count) => count > 0),
    ]);

    res.json({ data: { group, todayWorkers, todayNotes, hasUnreadNotification } });
  } catch (err) {
    next(err);
  }
});

// GET /main/schedule?date=YYYY-MM-DD — 해당 월 내 스케줄 + 인수인계 있는 날
router.get("/schedule", async (req, res, next) => {
  const { date } = req.query as { date?: string };
  const groupId = req.user!.groupId;
  const myUserId = req.user!.userId;

  if (!groupId)
    return res.json({ data: { schedule: null, noteDays: [] } });

  try {
    const now = date ? new Date(date) : new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const [rawSchedule, notes] = await Promise.all([
      prisma.schedule.findFirst({
        where: { groupId, date: { startsWith: yearMonth }, deletedAt: null },
        include: { workers: { orderBy: { createdAt: "asc" } } },
      }),
      prisma.note.findMany({
        where: {
          groupId,
          date: { gte: monthStart, lte: monthEnd },
          deletedAt: null,
        },
        select: { date: true },
      }),
    ]);

    const noteDays = notes.map((n) => new Date(n.date).getDate() - 1);

    if (!rawSchedule) return res.json({ data: { schedule: null, noteDays } });

    const grid = rawSchedule.schedule as number[][];
    const myIdx = rawSchedule.workers.findIndex((w) => w.userId === myUserId);

    res.json({
      data: {
        scheduleId: rawSchedule.scheduleId,
        date: rawSchedule.date,
        schedule: myIdx !== -1 ? grid[myIdx] : null,
        noteDays,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
