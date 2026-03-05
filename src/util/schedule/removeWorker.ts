import { ScheduleState } from "./types";

const removeWorker = (state: ScheduleState, idx: number): Partial<ScheduleState> => {
  const worker = state.worker.filter((_, i) => i !== idx);
  const schedule = state.schedule.filter((_, i) => i !== idx);
  return { worker, schedule };
};

export default removeWorker;