import { ScheduleState } from "./types";

const changeSchedule = (
  state: ScheduleState,
  emp: number,
  day: number,
  workType: number,
): Partial<ScheduleState> => {
  const { numDays, worker, schedule, dayGroup, nightGroup, group, dayWorkCount, nightWorkCount, aloneCount } = state;

  const dGroupIdx = (32 + group - day) % 4;
  const nGroupIdx = (32 + group - day + 1) % 4;

  if (schedule[emp][day] === workType) return {};

  /* 휴무로 변경 */
  if (workType === 0) {
    if (schedule[emp][day] === 1) {
      worker[emp].workCount--;
      dayWorkCount[day]--;
      if (dayWorkCount[day] === 0) { dayGroup[dGroupIdx]--; aloneCount[emp]--; }
      if (dayWorkCount[day] === 1) {
        dayGroup[dGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 1);
        if (target > -1) aloneCount[target]++;
      }
    }
    if (schedule[emp][day] === 2) {
      worker[emp].workCount--;
      nightWorkCount[day]--;
      if (nightWorkCount[day] === 0) { nightGroup[nGroupIdx]--; aloneCount[emp]--; }
      if (nightWorkCount[day] === 1) {
        nightGroup[nGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 2);
        if (target > -1) aloneCount[target]++;
      }
      if (day < numDays - 1) { schedule[emp][day + 1] = 0; worker[emp].workCount--; }
    }
    if (schedule[emp][day] === 3) { if (day !== 0) return {}; worker[emp].workCount--; }
    if (schedule[emp][day] === 4) worker[emp].workCount--;
    schedule[emp][day] = 0;
  }

  /* 주간으로 변경 */
  if (workType === 1) {
    if (schedule[emp][day] === 2) {
      nightWorkCount[day]--;
      if (nightWorkCount[day] === 0) { nightGroup[nGroupIdx]--; aloneCount[emp]--; }
      if (nightWorkCount[day] === 1) {
        nightGroup[nGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 2);
        if (target > -1) aloneCount[target]++;
      }
      if (day < numDays - 1) { schedule[emp][day + 1] = 0; worker[emp].workCount--; }
    }
    if (schedule[emp][day] === 3) if (day !== 0) return {};
    if (schedule[emp][day] === 0 || schedule[emp][day] === 5) worker[emp].workCount++;
    schedule[emp][day] = 1;
    dayWorkCount[day]++;
    if (dayWorkCount[day] === 1) { dayGroup[dGroupIdx]++; aloneCount[emp]++; }
    if (dayWorkCount[day] === 2) {
      dayGroup[dGroupIdx]--;
      const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 1);
      if (target > -1) aloneCount[target]--;
    }
  }

  /* 야간으로 변경 */
  if (workType === 2) {
    if (day < numDays - 1 && schedule[emp][day + 1] !== 0) return {};
    if (schedule[emp][day] === 0 || schedule[emp][day] === 5) worker[emp].workCount++;
    if (schedule[emp][day] === 1) {
      dayWorkCount[day]--;
      if (dayWorkCount[day] === 0) { dayGroup[dGroupIdx]--; aloneCount[emp]--; }
      if (dayWorkCount[day] === 1) {
        dayGroup[dGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 1);
        if (target > -1) aloneCount[target]++;
      }
    }
    if (schedule[emp][day] === 3) if (day !== 0) return {};
    if (day < numDays - 1) { schedule[emp][day + 1] = 3; worker[emp].workCount++; }
    schedule[emp][day] = 2;
    nightWorkCount[day]++;
    if (nightWorkCount[day] === 1) { nightGroup[nGroupIdx]++; aloneCount[emp]++; }
    if (nightWorkCount[day] === 2) {
      nightGroup[nGroupIdx]--;
      const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 2);
      if (target > -1) aloneCount[target]--;
    }
  }

  /* 비번으로 변경 */
  if (workType === 3) {
    if (day !== 0) return {};
    if (schedule[emp][day] === 0 || schedule[emp][day] === 5) worker[emp].workCount++;
    if (schedule[emp][day] === 1) {
      dayWorkCount[day]--;
      if (dayWorkCount[day] === 0) { dayGroup[dGroupIdx]--; aloneCount[emp]--; }
      if (dayWorkCount[day] === 1) {
        dayGroup[dGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 1);
        if (target > -1) aloneCount[target]++;
      }
    }
    if (schedule[emp][day] === 2) {
      schedule[emp][day + 1] = 0;
      worker[emp].workCount--;
      nightWorkCount[day]--;
      if (nightWorkCount[day] === 0) { nightGroup[nGroupIdx]--; aloneCount[emp]--; }
      if (nightWorkCount[day] === 1) {
        nightGroup[nGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 2);
        if (target > -1) aloneCount[target]++;
      }
    }
    schedule[emp][day] = 3;
  }

  /* 연차로 변경 */
  if (workType === 4) {
    if (schedule[emp][day] === 0 || schedule[emp][day] === 5) worker[emp].workCount++;
    if (schedule[emp][day] === 1) {
      dayWorkCount[day]--;
      if (dayWorkCount[day] === 0) { dayGroup[dGroupIdx]--; aloneCount[emp]--; }
      if (dayWorkCount[day] === 1) {
        dayGroup[dGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 1);
        if (target > -1) aloneCount[target]++;
      }
    }
    if (schedule[emp][day] === 2) {
      nightWorkCount[day]--;
      if (nightWorkCount[day] === 0) { nightGroup[nGroupIdx]--; aloneCount[emp]--; }
      if (nightWorkCount[day] === 1) {
        nightGroup[nGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 2);
        if (target > -1) aloneCount[target]++;
      }
      if (day < numDays - 1) { schedule[emp][day + 1] = 0; worker[emp].workCount--; }
    }
    if (schedule[emp][day] === 3) if (day !== 0) return {};
    schedule[emp][day] = 4;
  }

  /* 지정 휴일로 변경 */
  if (workType === 5) {
    if (schedule[emp][day] === 1) {
      worker[emp].workCount--;
      dayWorkCount[day]--;
      if (dayWorkCount[day] === 0) { dayGroup[dGroupIdx]--; aloneCount[emp]--; }
      if (dayWorkCount[day] === 1) {
        dayGroup[dGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 1);
        if (target > -1) aloneCount[target]++;
      }
    }
    if (schedule[emp][day] === 2) {
      nightWorkCount[day]--;
      if (nightWorkCount[day] === 0) { nightGroup[nGroupIdx]--; aloneCount[emp]--; }
      if (nightWorkCount[day] === 1) {
        nightGroup[nGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 2);
        if (target > -1) aloneCount[target]++;
      }
      worker[emp].workCount--;
      if (day < numDays - 1) { schedule[emp][day + 1] = 0; worker[emp].workCount--; }
    }
    if (schedule[emp][day] === 3) if (day !== 0) return {};
    if (schedule[emp][day] === 4) worker[emp].workCount--;
    schedule[emp][day] = 5;
  }

  /* 특별 휴가로 변경 */
  if (workType === 6) {
    if (schedule[emp][day] === 0 || schedule[emp][day] === 5) worker[emp].workCount++;
    if (schedule[emp][day] === 1) {
      dayWorkCount[day]--;
      if (dayWorkCount[day] === 0) { dayGroup[dGroupIdx]--; aloneCount[emp]--; }
      if (dayWorkCount[day] === 1) {
        dayGroup[dGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 1);
        if (target > -1) aloneCount[target]++;
      }
    }
    if (schedule[emp][day] === 2) {
      nightWorkCount[day]--;
      if (nightWorkCount[day] === 0) { nightGroup[nGroupIdx]--; aloneCount[emp]--; }
      if (nightWorkCount[day] === 1) {
        nightGroup[nGroupIdx]++;
        const target = worker.findIndex((_, idx) => idx !== emp && schedule[idx][day] === 2);
        if (target > -1) aloneCount[target]++;
      }
      if (day < numDays - 1) { schedule[emp][day + 1] = 0; worker[emp].workCount--; }
    }
    if (schedule[emp][day] === 3) if (day !== 0) return {};
    schedule[emp][day] = 6;
  }

  return { schedule, worker, dayGroup, nightGroup, dayWorkCount, nightWorkCount, aloneCount };
};

export default changeSchedule;