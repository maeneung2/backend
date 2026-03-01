import { Dayjs } from "dayjs";

interface User {
  userId: string;
  userName: string;
  userProfile: string;
  groupId: string; // group_id
  phone: string;
  password: string;
  admin: boolean;
  createdAt: Dayjs;
  updatedAt: Dayjs;
}

export default User;
