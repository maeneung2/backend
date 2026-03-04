import { z } from "zod";

export const createScheduleSchema = z.object({
  schedule: z.array(z.string()).min(1, "스케줄을 입력해주세요."),
  groupId: z.string().uuid("올바른 그룹 ID를 입력해주세요."),
});

export const updateScheduleSchema = z.object({
  schedule: z.array(z.string()).min(1).optional(),
});