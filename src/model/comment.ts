import { Dayjs } from "dayjs";

interface Comment {
  commentId: string;
  type: 0 | 1; // 0 : 공지사항 , 1 : 댓글
  targetId: string;
  content: string;
  writer: string;
  groupId: string;
  createdAt: Dayjs;
  updatedAt: Dayjs;
}

export default Comment;
