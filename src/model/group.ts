import { Dayjs } from "dayjs";
import User from "./user";

interface Group {
  groupId: string;
  groupName: string;
  groupUsers: User[]; //user_id
  groupProfile: string;
  groupType: 0 | 1 | 2 | 3 | 4; // 0: 형태 미지정, 1: 4조 2교대, 3: 3조 2교대, 4: 추가 예정...
  scheduleId: string;
  ownerId: string; //user_id
  createdAt: Dayjs;
  updatedAt: Dayjs;
}

export default Group;
