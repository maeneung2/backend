import { ScheduleState } from "./types";
import applySingleSchedule from "./applySingleSchedule";

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

  for (let day = 0; day < numDays; day++)
    if (dayWorkCount[day] < 2)
      applySingleSchedule(
        day,
        schedule,
        worker,
        aloneCount,
        dayWorkCount,
        dayGroup,
        numDays,
        group,
      );

  let ranDate = Array.from({ length: numDays }, (_, i) => i).sort(
    () => Math.random() - 0.5,
  );

  while (ranDate.length > 0) {
    // const minIndex = dayGroup
    //   .map((value, index) => ({ index, value }))
    //   .reduce((min, curr) => (curr.value < min.value ? curr : min)).index;

    // ranDate.sort((a, b) => {
    //   const aKey = a % 4 === minIndex ? 0 : 1;
    //   const bKey = b % 4 === minIndex ? 0 : 1;
    //   return aKey - bKey;
    // });

    const select = ranDate.pop()!;
    if (dayWorkCount[select] < 2)
      applySingleSchedule(
        select,
        schedule,
        worker,
        aloneCount,
        dayWorkCount,
        dayGroup,
        numDays,
        group,
      );
  }

  return { schedule, dayGroup, worker, dayWorkCount, aloneCount };
};

export default makeSingleSchedule;
