import Notice from "../model/notice";
import dayjs from "dayjs";

export const defaultNotice: Notice = {
  noticeId: "default_notice_id",
  title: "제에에에목",
  content: "내애애애애애용",
  images: [],
  writer: "admin_user_id",
  groupId: "default_group_id",
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};

export const noticeList: Notice[] = [
  defaultNotice,
  defaultNotice,
  defaultNotice,
  defaultNotice,
  defaultNotice,
  defaultNotice,
  defaultNotice,
  defaultNotice,
  defaultNotice,
  defaultNotice,
];
