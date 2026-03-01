import Notice from "../model/notice";
import dayjs from "dayjs";
import Notification from "../model/notification";

export const noticeNotification: Notification = {
  content: "공지사항임",
  notificationId: "default_notification_id",
  read: false,
  url: "/",
  type: 0,
  createdAt: dayjs("2026.02.23"),
};

export const scheduleNotification: Notification = {
  content: "스케줄 임",
  notificationId: "default_notification_id",
  read: false,
  url: "/",
  type: 1,
  createdAt: dayjs("2026.02.23"),
};

export const commentNotification: Notification = {
  content: "댓글이 달림",
  notificationId: "default_notification_id",
  read: false,
  url: "/",
  type: 2,
  createdAt: dayjs("2026.02.23"),
};

export const notificationList: Notification[] = [
  noticeNotification,
  scheduleNotification,
  commentNotification,
  noticeNotification,
  scheduleNotification,
  commentNotification,
  noticeNotification,
  scheduleNotification,
  commentNotification,
];
