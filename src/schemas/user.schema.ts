import { z } from "zod";

export const updateUserSchema = z.object({
  userName: z.string().min(1).optional(),
  groupId: z.string().uuid().optional(),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, "올바른 전화번호를 입력해주세요.")
    .optional(),
});