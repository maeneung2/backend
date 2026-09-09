import { Employee } from "./types";

const applyNightSchedule = (
  day: number,
  schedule: number[][],
  worker: Employee[],
  aloneCount: number[],
  workCount: number[],
  groupCount: number[],
  numDays: number,
  group: number,
): boolean => {
  const numWorkers = worker.length;
  let candidates: number[] = Array.from({ length: numWorkers }, (_, i) => i);

  candidates = candidates.filter(
    (w) => worker[w].fixedWorkType === 2 || worker[w].fixedWorkType === 0,
  );
  candidates = candidates.filter((w) => schedule[w][day] === 0);

  if (workCount[day] === 0)
    candidates = candidates.filter((w) => !worker[w].isNew);

  if (day + 1 < numDays)
    candidates = candidates.filter((w) => schedule[w][day + 1] === 0);

  if (day + 2 < numDays)
    candidates = candidates.filter((w) => schedule[w][day + 2] !== 1);

  candidates = candidates.filter((w) => {
    const before = schedule[w].slice(0, day);
    const rawPrevFree = Math.max(
      before.lastIndexOf(0),
      before.lastIndexOf(4),
      before.lastIndexOf(5),
    );
    const prevFree = rawPrevFree === -1
      ? -(worker[w].prevWorkCount ?? 0) - 1
      : rawPrevFree;

    const after = schedule[w].slice(day + 2);
    const indices = [after.indexOf(0), after.indexOf(4), after.indexOf(5)].filter(
      (v) => v !== -1,
    );
    const nextFree = indices.length > 0 ? day + 2 + Math.min(...indices) : numDays;

    return nextFree - prevFree < 6;
  });

  candidates = candidates.filter(
    (w) => worker[w].workCount < numDays - worker[w].restCount + 1,
  );

  if (day > 0) {
    const temp = candidates.filter((w) => schedule[w][day - 1] !== 3);
    if (temp.length > 0) candidates = temp;
  }

  // 야비야비(2,3,2) 최소화: 앞뒤 2일 내 야간이 없는 후보 우선
  const withoutYabiYabi = candidates.filter((w) => {
    const prevNight = day >= 2 && schedule[w][day - 2] === 2;
    const nextNight = day + 2 < numDays && schedule[w][day + 2] === 2;
    return !prevNight && !nextNight;
  });
  if (withoutYabiYabi.length > 0) candidates = withoutYabiYabi;

  // if (schedule.filter((w) => w[day] === 2).length > 0) {
  //   candidates = candidates.sort((a, b) =>
  //     aloneCount[a] <= aloneCount[b] ? -1 : 1,
  //   );
  // } else {
  //   candidates = candidates.sort(() => Math.random() - 0.5);
  // }
  //
  // candidates = candidates.filter(
  //   (v) => aloneCount[v] === aloneCount[candidates[0]],
  // );

  const temp = candidates.filter((w) => worker[w].fixedWorkType === 2);

  candidates = temp.length > 0 ? temp : candidates;

  candidates = candidates.sort((a, b) => {
    const remainA = (numDays - worker[a].restCount + 1) - worker[a].workCount;
    const remainB = (numDays - worker[b].restCount + 1) - worker[b].workCount;
    return remainB - remainA || Math.random() - 0.5;
  });

  if (candidates.length > 0) {
    const selected = candidates[0];
    schedule[selected][day] = 2;
    if (day + 1 < numDays) {
      schedule[selected][day + 1] = 3;
      worker[selected].workCount++;
    }
    workCount[day]++;
    worker[selected].workCount++;
    return true;
  }
  return false;
};

export default applyNightSchedule;
