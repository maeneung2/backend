import { ScheduleState } from "./types";
import applySingleSchedule from "./applySingleSchedule";
import applyNightSchedule from "./applyNightSchedule";
import { repairDaySchedule, repairNightSchedule } from "./repairSchedule";

const makeSchedule = (state: ScheduleState): Partial<ScheduleState> => {
  const {
    schedule,
    worker,
    aloneCount,
    numDays,
    selectedDay,
    selectedNight,
    dayGroup,
    nightGroup,
    dayWorkCount,
    nightWorkCount,
    group,
  } = state;

  // Phase 1: 지정 날짜 우선 배정
  for (const date of selectedDay)
    applySingleSchedule(date, schedule, worker, aloneCount, dayWorkCount, dayGroup, numDays, group);

  for (const date of selectedNight)
    applyNightSchedule(date, schedule, worker, aloneCount, nightWorkCount, nightGroup, numDays, group);

  // Phase 2: 주간 1명 → 야간 1명 → 주간 2명 → 야간 2명 → ...
  let dayRound = 0;
  let nightRound = 0;
  let anyDayAssigned = true;
  let anyNightAssigned = true;

  while (anyDayAssigned || anyNightAssigned) {
    anyDayAssigned = false;
    const dayDays = Array.from({ length: numDays }, (_, i) => i).sort(
      () => Math.random() - 0.5,
    );
    for (const day of dayDays) {
      if (dayWorkCount[day] !== dayRound) continue;
      if (applySingleSchedule(day, schedule, worker, aloneCount, dayWorkCount, dayGroup, numDays, group))
        anyDayAssigned = true;
    }
    dayRound++;

    anyNightAssigned = false;
    const nightDays = Array.from({ length: numDays }, (_, i) => i).sort(
      () => Math.random() - 0.5,
    );
    for (const day of nightDays) {
      if (nightWorkCount[day] !== nightRound) continue;
      if (applyNightSchedule(day, schedule, worker, aloneCount, nightWorkCount, nightGroup, numDays, group))
        anyNightAssigned = true;
    }
    nightRound++;
  }

  // Phase 3: 보정
  repairDaySchedule(schedule, worker, numDays);
  repairNightSchedule(schedule, worker, numDays);

  return { schedule, dayGroup, nightGroup, worker, dayWorkCount, nightWorkCount, aloneCount };
};

export default makeSchedule;
