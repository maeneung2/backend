import { ScheduleState } from "./types";
import applySingleSchedule from "./applySingleSchedule";
import { repairDaySchedule } from "./repairSchedule";

const makeSingleSchedule = (state: ScheduleState): Partial<ScheduleState> => {
  const {
    schedule,
    worker,
    aloneCount,
    numDays,
    selectedDay,
    dayGroup,
    dayWorkCount,
    group,
  } = state;

  for (const date of selectedDay)
    applySingleSchedule(
      date,
      schedule,
      worker,
      aloneCount,
      dayWorkCount,
      dayGroup,
      numDays,
      group,
    );

  // 라운드 방식: 1인 배치 완료 → 2인 배치 → 3인 배치 ...
  let round = 0;
  let anyAssigned = true;
  while (anyAssigned) {
    anyAssigned = false;
    const days = Array.from({ length: numDays }, (_, i) => i).sort(
      () => Math.random() - 0.5,
    );
    for (const day of days) {
      if (dayWorkCount[day] !== round) continue;
      const assigned = applySingleSchedule(
        day,
        schedule,
        worker,
        aloneCount,
        dayWorkCount,
        dayGroup,
        numDays,
        group,
      );
      if (assigned) anyAssigned = true;
    }
    round++;
  }

  repairDaySchedule(schedule, worker, numDays);

  return { schedule, dayGroup, worker, dayWorkCount, aloneCount };
};

export default makeSingleSchedule;
