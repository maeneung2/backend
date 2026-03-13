import { Employee } from "./types";

const applySingleSchedule = (
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
    (w) => worker[w].fixedWorkType === 1 || worker[w].fixedWorkType === 0,
  );

  if (workCount[day] === 0)
    candidates = candidates.filter((w) => !worker[w].isNew);

  if (day > 0)
    candidates = candidates.filter((w) => schedule[w][day - 1] !== 3);

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

    const after = schedule[w].slice(day + 1);
    const indices = [after.indexOf(0), after.indexOf(4), after.indexOf(5)].filter(
      (v) => v !== -1,
    );
    const nextFree = indices.length > 0 ? day + 1 + Math.min(...indices) : numDays;

    return nextFree - prevFree < 6;
  });

  candidates = candidates.filter(
    (w) =>
      worker[w].workCount < numDays - worker[w].restCount &&
      schedule[w][day] === 0,
  );

  // if (workCount[day] === 1) {
  //   candidates = candidates.sort((a, b) =>
  //     aloneCount[a] <= aloneCount[b] ? -1 : 1,
  //   );
  // } else {
  //   candidates = candidates.sort(() => Math.random() - 0.5);
  // }

  const temp = candidates.filter((w) => worker[w].fixedWorkType === 1);

  candidates = temp.length > 0 ? temp : candidates;

  candidates = candidates.sort((a, b) => {
    const remainA = (numDays - worker[a].restCount) - worker[a].workCount;
    const remainB = (numDays - worker[b].restCount) - worker[b].workCount;
    return remainB - remainA || Math.random() - 0.5;
  });

  if (candidates.length > 0) {
    const selected = candidates[0];
    schedule[selected][day] = 1;
    worker[selected].workCount++;
    workCount[day]++;
    return true;
  }
  return false;
};

export default applySingleSchedule;
