export interface Employee {
  name: string;
  workCount: number;
  restCount: number;
  isNight: boolean;
  isNew?: boolean;
  prevWorkCount?: number;
}

export interface ScheduleState {
  date: string;
  weekday: number;
  numDays: number;
  group: number;
  selectedDay: number[];
  selectedNight: number[];
  schedule: number[][];
  worker: Employee[];
  dayGroup: number[];
  nightGroup: number[];
  dayWorkCount: number[];
  nightWorkCount: number[];
  aloneCount: number[];
}