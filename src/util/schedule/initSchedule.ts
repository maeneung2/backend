import { Employee, ScheduleState } from "./types";

const initSchedule = (dateStr: string, group: number, workers: Employee[]): ScheduleState => {
  const d = new Date(dateStr);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const weekday = firstDay.getDay();
  const numDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  const wk = [
    ...workers.filter((e) => !e.isNight),
    ...workers.filter((e) => e.isNight),
  ].map((w) => ({ ...w, workCount: 0 }));

  const selectedDay: number[] = [];
  const selectedNight: number[] = [];

  for (let i = 0; i < numDays; i++) {
    if ([5, 6].includes((weekday + i) % 7)) selectedNight.push(i);
    if ((weekday + i) % 7 === 6) selectedDay.push(i);
  }

  const year = firstDay.getFullYear();
  const month = String(firstDay.getMonth() + 1).padStart(2, "0");

  return {
    date: `${year}-${month}-01`,
    weekday,
    numDays,
    group,
    worker: wk,
    schedule: Array.from({ length: wk.length }, () => Array(numDays).fill(0)),
    selectedDay,
    selectedNight,
    aloneCount: Array(wk.length).fill(0),
    dayGroup: [0, 0, 0, 0],
    nightGroup: [0, 0, 0, 0],
    dayWorkCount: Array(numDays).fill(0),
    nightWorkCount: Array(numDays).fill(0),
  };
};

export default initSchedule;