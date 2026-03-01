import { Dayjs } from "dayjs";

interface Note {
  noteId: string;
  content: string;
  date: Dayjs;
  writer: string;
  groupId: string;
  createdAt: Dayjs;
  updatedAt: Dayjs;
}

export default Note;
