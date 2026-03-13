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

  // Phase 2: 주간/야간 교대로, 가장 인원이 적은 날 하나씩 배정 (균등 분배)
  let anyAssigned = true;
  while (anyAssigned) {
    anyAssigned = false;

    const dayDays = Array.from({ length: numDays }, (_, i) => i).sort(
      (a, b) => dayWorkCount[a] - dayWorkCount[b] || Math.random() - 0.5,
    );
    for (const day of dayDays) {
      if (applySingleSchedule(day, schedule, worker, aloneCount, dayWorkCount, dayGroup, numDays, group)) {
        anyAssigned = true;
        break;
      }
    }

    const nightDays = Array.from({ length: numDays }, (_, i) => i).sort(
      (a, b) => nightWorkCount[a] - nightWorkCount[b] || Math.random() - 0.5,
    );
    for (const day of nightDays) {
      if (applyNightSchedule(day, schedule, worker, aloneCount, nightWorkCount, nightGroup, numDays, group)) {
        anyAssigned = true;
        break;
      }
    }
  }

  // Phase 3: 보정
  repairDaySchedule(schedule, worker, numDays);
  repairNightSchedule(schedule, worker, numDays);

  return { schedule, dayGroup, nightGroup, worker, dayWorkCount, nightWorkCount, aloneCount };
};

export default makeSchedule;
