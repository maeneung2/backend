import { ScheduleState } from "./types";

const initNextMonth = (state: ScheduleState): ScheduleState => {
  const { worker, date, group, schedule } = state;

  const prev = new Date(date);
  const prevDaysInMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 0).getDate();

  const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
  const weekday = next.getDay();
  const numDays = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();

  const wk = [
    ...worker.filter((e) => e.fixedWorkType !== 2),
    ...worker.filter((e) => e.fixedWorkType === 2),
  ].map((w) => ({ ...w, workCount: 0 }));

  const sch: number[][] = Array.from({ length: wk.length }, () => Array(numDays).fill(0));

  for (let i = 0; i < worker.length; i++) {
    if (schedule[i][schedule[i].length - 1] === 2) {
      sch[i][0] = 3;
      wk[i].workCount += 1;
    }
    wk[i].prevWorkCount = schedule[i].length - 1 - schedule[i].lastIndexOf(0);
  }

  const selectedDay: number[] = [];
  const selectedNight: number[] = [];

  for (let i = 0; i < numDays; i++) {
    if ([5, 6].includes((weekday + i) % 7)) selectedNight.push(i);
    if ((weekday + i) % 7 === 6) selectedDay.push(i);
  }

  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, "0");

  return {
    date: `${year}-${month}-01`,
    weekday,
    numDays,
    group: (group + prevDaysInMonth) % 4,
    worker: wk,
    schedule: sch,
    selectedDay,
    selectedNight,
    aloneCount: Array(wk.length).fill(0),
    dayGroup: [0, 0, 0, 0],
    nightGroup: [0, 0, 0, 0],
    dayWorkCount: Array(numDays).fill(0),
    nightWorkCount: Array(numDays).fill(0),
  };
};

export default initNextMonth;