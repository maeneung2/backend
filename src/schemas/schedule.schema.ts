import { z } from "zod";

export const generateScheduleSchema = z.object({
  groupId: z.string().uuid("올바른 그룹 ID를 입력해주세요."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식으로 입력해주세요."),
  selectedDay: z.array(z.number().int().min(0).max(30)),
  selectedNight: z.array(z.number().int().min(0).max(30)),
  pattern: z.array(z.number().int()).optional(),
  workers: z.array(z.object({
    userId: z.string().uuid(),
    fixedWorkType: z.number().int().refine((v) => [0, 1, 2, 6, 7, 8].includes(v), {
      message: "fixedWorkType은 0, 1, 2, 6, 7, 8 중 하나여야 합니다.",
    }).default(0),
    restCount: z.number().int().min(0).default(0),
    isNew: z.boolean().default(false),
    plan: z.array(z.number().int().min(0).max(6)).optional(),
  })),
});