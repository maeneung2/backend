import { z } from "zod";

export const createNoticeSchema = z.object({
  groupId: z.string().uuid("올바른 그룹 ID를 입력해주세요."),
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  image: z.array(z.string().url()).optional(),
});

export const updateNoticeSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  image: z.array(z.string().url()).optional(),
});