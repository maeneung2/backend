import { Employee, ScheduleState } from "./types";

export function getWeekdayCount(date: string): number {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  let count = 0;
  for (let i = 0; i < numDays; i++) {
    const day = (firstWeekday + i) % 7;
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export type WorkerInput = {
  userId: string;
  fixedWorkType: number;
  restCount: number;
  isNew: boolean;
  plan?: number[];
  prevWorkCount?: number;
  lastWorkType?: number;
};

export function buildScheduleState(params: {
  date: string;
  schedule: number[][];
  selectedDay: number[];
  selectedNight: number[];
  workers: WorkerInput[];
}): ScheduleState {
  const { date, schedule, selectedDay, selectedNight, workers } = params;

  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const weekday = firstDay.getDay();
  const numDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  const worker: Employee[] = workers.map((sw, i) => ({
    name: sw.userId,
    fixedWorkType: sw.fixedWorkType ?? 0,
    restCount: sw.restCount,
    isNew: sw.isNew,
    prevWorkCount: sw.prevWorkCount,
    workCount: computeWorkCount(schedule[i] ?? [], sw.fixedWorkType),
  }));

  return {
    date,
    weekday,
    numDays,
    group: 0,
    worker,
    schedule,
    selectedDay,
    selectedNight,
    aloneCount: computeAloneCount(schedule, numDays),
    dayGroup: [0, 0, 0, 0],
    nightGroup: [0, 0, 0, 0],
    dayWorkCount: computeDayWorkCount(schedule, numDays),
    nightWorkCount: computeNightWorkCount(schedule, numDays),
  };
}

function computeWorkCount(
  workerSchedule: number[],
  fixedWorkType?: number | null,
): number {
  if (fixedWorkType === 2)
    return workerSchedule.filter((c) => [2, 3].includes(c)).length;
  return workerSchedule.filter((c) => [1, 4].includes(c)).length;
}

export function computeDayWorkCount(
  schedule: number[][],
  numDays: number,
): number[] {
  return Array.from(
    { length: numDays },
    (_, day) => schedule.filter((w) => w[day] === 1).length,
  );
}

export function computeNightWorkCount(
  schedule: number[][],
  numDays: number,
): number[] {
  return Array.from(
    { length: numDays },
    (_, day) => schedule.filter((w) => w[day] === 2).length,
  );
}

export function computeAloneCount(
  schedule: number[][],
  numDays: number,
): number[] {
  return schedule.map((_, wi) => {
    let count = 0;
    for (let day = 0; day < numDays; day++) {
      const cell = schedule[wi][day];
      if (
        cell === 1 &&
        schedule.filter((w, i) => i !== wi && w[day] === 1).length === 0
      )
        count++;
      if (
        cell === 2 &&
        schedule.filter((w, i) => i !== wi && w[day] === 2).length === 0
      )
        count++;
    }
    return count;
  });
}
