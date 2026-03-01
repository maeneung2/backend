import { Dayjs } from "dayjs";

interface Notice {
  noticeId: string;
  title: string;
  content: string;
  images: string[];
  writer: "admin_user_id";
  groupId: "default_group_id";
  createdAt: Dayjs;
  updatedAt: Dayjs;
}

export default Notice;
