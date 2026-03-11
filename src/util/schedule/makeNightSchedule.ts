import { ScheduleState } from "./types";
import applyNightSchedule from "./applyNightSchedule";

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

  for (let day = 0; day < numDays; day++)
    if (nightWorkCount[day] < 2)
      applyNightSchedule(
        day,
        schedule,
        worker,
        aloneCount,
        nightWorkCount,
        nightGroup,
        numDays,
        group,
      );

  let ranDate = Array.from({ length: numDays }, (_, i) => i).sort(
    () => Math.random() - 0.5,
  );

  while (ranDate.length > 0) {
    // const minIndex = nightGroup
    //   .map((value, index) => ({ index, value }))
    //   .reduce((min, curr) => (curr.value >= min.value ? curr : min)).index;
    //
    // ranDate.sort((a, b) => {
    //   const aKey = a % 4 === minIndex ? 0 : 1;
    //   const bKey = b % 4 === minIndex ? 0 : 1;
    //   return aKey - bKey;
    // });

    const select = ranDate.pop()!;
    if (nightWorkCount[select] < 2)
      applyNightSchedule(
        select,
        schedule,
        worker,
        aloneCount,
        nightWorkCount,
        nightGroup,
        numDays,
        group,
      );
  }

  return { schedule, nightGroup, aloneCount, worker, nightWorkCount };
};

export default makeNightSchedule;
