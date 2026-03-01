import dayjs from "dayjs";
import Note from "../model/note";

export const defaultNote: Note = {
  noteId: "default_notice_id",
  content: "내애애애애애용",
  writer: "admin_user_id",
  date: dayjs("2026.02.23"),
  groupId: "default_group_id",
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};

export const noteList: Note[] = [
  defaultNote,
  defaultNote,
  defaultNote,
  defaultNote,
  defaultNote,
  defaultNote,
  defaultNote,
  defaultNote,
  defaultNote,
];
