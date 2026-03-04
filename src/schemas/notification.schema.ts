import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid("올바른 유저 ID를 입력해주세요."),
  type: z.number().int().min(0),
  content: z.string().min(1, "내용을 입력해주세요."),
  url: z.string().min(1, "URL을 입력해주세요."),
});