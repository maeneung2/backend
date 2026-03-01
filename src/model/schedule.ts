import { Dayjs } from "dayjs";

interface User {
  scheduleId: string;
  schedule: number[][];
  groupId: string;
  createdAt: Dayjs;
  updatedAt: Dayjs;
}

export default User;
