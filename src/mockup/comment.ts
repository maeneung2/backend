import dayjs from "dayjs";
import Comment from "../model/comment";

export const defaultComment: Comment = {
  commentId: "default_comment_id",
  content: "내애애애애애용",
  type: 0,
  targetId: "default_notice_id",
  writer: "default_user_id",
  groupId: "default_group_id",
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};

export const nestedComment: Comment = {
  commentId: "nested_comment_id",
  content: "대댓",
  type: 1,
  targetId: "default_comment_id",
  writer: "admin_user_id",
  groupId: "default_group_id",
  createdAt: dayjs("2026.02.23"),
  updatedAt: dayjs("2026.02.23"),
};

export const commentList: Comment[] = [
  defaultComment,
  nestedComment,
  defaultComment,
  defaultComment,
  defaultComment,
  nestedComment,
];
