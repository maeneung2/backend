import { Dayjs } from "dayjs";

interface Notification {
  notificationId: string;
  type: 0 | 1 | 2; //0: 공지사항 알림, 1: 스케줄 알림, 2: 답글
  url: string;
  read: boolean;
  content: string;
  createdAt: Dayjs;
}

export default Notification;
