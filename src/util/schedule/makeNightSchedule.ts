import { ScheduleState } from "./types";
import applyNightSchedule from "./applyNightSchedule";
import { repairNightSchedule } from "./repairSchedule";

const makeNightSchedule = (state: ScheduleState): Partial<ScheduleState> => {
  const {
    schedule,
    nightWorkCount,
    nightGroup,
    worker,
    aloneCount,
    numDays,
    selectedNight,
    group,
  } = state;

  for (const date of selectedNight)
    applyNightSchedule(
      date,
      schedule,
      worker,
      aloneCount,
      nightWorkCount,
      nightGroup,
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
      if (nightWorkCount[day] !== round) continue;
      const assigned = applyNightSchedule(
        day,
        schedule,
        worker,
        aloneCount,
        nightWorkCount,
        nightGroup,
        numDays,
        group,
      );
      if (assigned) anyAssigned = true;
    }
    round++;
  }

  repairNightSchedule(schedule, worker, numDays);

  return { schedule, nightGroup, aloneCount, worker, nightWorkCount };
};

export default makeNightSchedule;
