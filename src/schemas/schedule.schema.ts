import { z } from "zod";

export const generateScheduleSchema = z.object({
  groupId: z.string().uuid("올바른 그룹 ID를 입력해주세요."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식으로 입력해주세요."),
  selectedDay: z.array(z.number().int().min(0).max(30)),
  selectedNight: z.array(z.number().int().min(0).max(30)),
  workers: z.array(z.object({
    userId: z.string().uuid(),
    isNight: z.boolean().default(false),
    restCount: z.number().int().min(0).default(0),
    isNew: z.boolean().default(false),
    plan: z.array(z.number().int().min(0).max(6)).optional(),
  })),
});