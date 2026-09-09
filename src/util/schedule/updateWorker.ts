import { Employee, ScheduleState } from "./types";

const updateWorker = (state: ScheduleState, idx: number, emp: Employee): Partial<ScheduleState> => {
  state.worker[idx] = emp;
  return { worker: state.worker };
};

export default updateWorker;