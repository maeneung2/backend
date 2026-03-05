import { z } from "zod";

export const generateScheduleSchema = z.object({
  groupId: z.string().uuid("올바른 그룹 ID를 입력해주세요."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식으로 입력해주세요."),
  selectedDay: z.array(z.number().int().min(0).max(30)),
  selectedNight: z.array(z.number().int().min(0).max(30)),
  schedule: z.array(z.array(z.number().int().min(0).max(6))),
});

export const updateCellSchema = z.object({
  emp: z.number().int().min(0),
  day: z.number().int().min(0),
  workType: z.number().int().min(0).max(6),
});