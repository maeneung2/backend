import { ScheduleState } from "./types";
import applyNightSchedule from "./applyNightSchedule";

const matchSchedule = (state: ScheduleState): Partial<ScheduleState> => {
  const {
    schedule,
    nightWorkCount,
    nightGroup,
    worker,
    aloneCount,
    numDays,
    group,
  } = state;

  let oneCount = nightWorkCount
    .map((c, idx) => (c === 1 ? idx : -1))
    .filter((v) => v > -1);

  while (oneCount.length > 0) {
    const minIndex = nightGroup
      .map((value, index) => ({ index, value }))
      .reduce((min, curr) => (curr.value >= min.value ? curr : min)).index;

    oneCount.sort((a, b) => {
      const aKey = a % 4 === minIndex ? 0 : 1;
      const bKey = b % 4 === minIndex ? 0 : 1;
      return aKey - bKey;
    });

    const select = oneCount.pop()!;
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

export default matchSchedule;
