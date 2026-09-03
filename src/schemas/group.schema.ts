import { z } from "zod";

export const createGroupSchema = z.object({
  groupName: z.string().min(1, "그룹 이름을 입력해주세요."),
});

export const updateGroupSchema = z.object({
  groupName: z.string().min(1).optional(),
  groupProfile: z.string().optional(),
  restBlocksNextDayDay: z.boolean().optional(),
});

export const addMemberSchema = z.object({
  id: z.string(),
});

export const transferOwnerSchema = z.object({
  userId: z.string().uuid("유효한 유저 ID를 입력해주세요."),
});
