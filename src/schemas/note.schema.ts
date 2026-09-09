import { z } from "zod";

export const createNoteSchema = z.object({
  groupId: z.string().uuid("올바른 그룹 ID를 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  date: z.string().datetime("올바른 날짜 형식을 입력해주세요."),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
});