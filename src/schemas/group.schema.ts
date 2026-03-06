import { z } from "zod";

export const createGroupSchema = z.object({
  groupName: z.string().min(1, "그룹 이름을 입력해주세요."),
});

export const updateGroupSchema = z.object({
  groupName: z.string().min(1).optional(),
  groupProfile: z.string().optional(),
});

export const addMemberSchema = z.object({
  id: z.string(),
});
