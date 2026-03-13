import { Employee } from "./types";

function checkSixDayRule(
  w: number,
  day: number,
  schedule: number[][],
  worker: Employee[],
  numDays: number,
  afterOffset: number,
): boolean {
  const before = schedule[w].slice(0, day);
  const rawPrevFree = Math.max(
    before.lastIndexOf(0),
    before.lastIndexOf(4),
    before.lastIndexOf(5),
  );
  const prevFree =
    rawPrevFree === -1 ? -(worker[w].prevWorkCount ?? 0) - 1 : rawPrevFree;

  const after = schedule[w].slice(day + afterOffset);
  const indices = [after.indexOf(0), after.indexOf(4), after.indexOf(5)].filter(
    (v) => v !== -1,
  );
  const nextFree =
    indices.length > 0 ? day + afterOffset + Math.min(...indices) : numDays;

  return nextFree - prevFree < 6;
}

export function repairDaySchedule(
  schedule: number[][],
  worker: Employee[],
  numDays: number,
): void {
  const workerIndices = Array.from({ length: worker.length }, (_, i) => i)
    .filter((w) => worker[w].fixedWorkType !== 2)
    .sort((a, b) => {
      const remainA = numDays - worker[a].restCount - worker[a].workCount;
      const remainB = numDays - worker[b].restCount - worker[b].workCount;
      return remainB - remainA;
    });

  for (const w of workerIndices) {
    const maxWork = numDays - worker[w].restCount;
    if (worker[w].workCount >= maxWork) continue;

    for (let day = 0; day < numDays; day++) {
      if (worker[w].workCount >= maxWork) break;
      if (schedule[w][day] !== 0) continue;
      if (day > 0 && schedule[w][day - 1] === 3) continue;
      if (!checkSixDayRule(w, day, schedule, worker, numDays, 1)) continue;

      schedule[w][day] = 1;
      worker[w].workCount++;
    }
  }
}

export function repairNightSchedule(
  schedule: number[][],
  worker: Employee[],
  numDays: number,
): void {
  const workerIndices = Array.from({ length: worker.length }, (_, i) => i)
    .filter((w) => worker[w].fixedWorkType !== 1)
    .sort((a, b) => {
      const remainA = numDays - worker[a].restCount + 1 - worker[a].workCount;
      const remainB = numDays - worker[b].restCount + 1 - worker[b].workCount;
      return remainB - remainA;
    });

  for (const w of workerIndices) {
    const maxWork = numDays - worker[w].restCount + 1;
    if (worker[w].workCount >= maxWork) continue;

    for (let day = 0; day < numDays; day++) {
      if (worker[w].workCount >= maxWork) break;
      if (schedule[w][day] !== 0) continue;
      if (day + 1 < numDays && schedule[w][day + 1] !== 0) continue;
      if (day + 2 < numDays && schedule[w][day + 2] === 1) continue;
      if (!checkSixDayRule(w, day, schedule, worker, numDays, 2)) continue;

      schedule[w][day] = 2;
      worker[w].workCount++;
      if (day + 1 < numDays) {
        schedule[w][day + 1] = 3;
        worker[w].workCount++;
      }
    }
  }
}
