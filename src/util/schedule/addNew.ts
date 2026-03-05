import { Employee, ScheduleState } from "./types";

const addNew = (
  state: ScheduleState,
  name: string,
  startDate: number,
): Partial<ScheduleState> => {
  const { weekday, worker, numDays, schedule, dayWorkCount } = state;

  const newSch = Array(numDays).fill(0);

  let targetWorkCount = 0;
  for (let i = 0; i <= numDays - startDate; i++)
    if ([1, 2, 3, 4, 5].includes((weekday + startDate + 1) % 7))
      targetWorkCount++;

  const newWk: Employee = {
    name,
    isNew: true,
    isNight: false,
    targetWorkCount,
    workCount: 0,
  };

  newSch[startDate - 1] = 1;
  newWk.workCount++;

  let validDate = Array.from(
    { length: numDays - startDate },
    (_, i) => startDate + i,
  );
  validDate = validDate.sort(() => Math.random() - 0.5);
  validDate = validDate.sort((v) => (dayWorkCount[v] === 1 ? 1 : -1));

  while (newWk.workCount < newWk.targetWorkCount) {
    const select = validDate.pop() ?? -1;
    if (select === -1) break;

    let valid = true;
    for (let i = 0; i < 5; i++)
      if (select >= 4 - i && select + i < numDays) {
        const recentWork = newSch.slice(select + i - 4, select + i + 1);
        if (recentWork.filter((v) => v === 1).length >= 4) valid = false;
      }

    if (valid) {
      newSch[select] = 1;
      newWk.workCount++;
    }
  }

  return { worker: [...worker, newWk], schedule: [...schedule, newSch] };
};

export default addNew;