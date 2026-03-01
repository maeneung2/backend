import dayjs from "dayjs";
import Schedule from "../model/schedule";

export const defaultSchedule: Schedule = {
  scheduleId: "defaultSchedule",
  schedule: Array(6).fill(Array(31).fill(0)),
  groupId: "defaultGroup",
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};
