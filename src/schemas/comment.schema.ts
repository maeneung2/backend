import { z } from "zod";

export const createCommentSchema = z.object({
  groupId: z.string().uuid("올바른 그룹 ID를 입력해주세요."),
  noticeId: z.string().uuid("올바른 공지사항 ID를 입력해주세요."),
  targetCommentId: z.string().uuid().optional(),
  content: z.string().min(1, "내용을 입력해주세요."),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, "내용을 입력해주세요."),
});