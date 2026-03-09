  import { z } from "zod";

export const sendInviteSchema = z.object({
  groupId: z.string().uuid("유효한 그룹 ID를 입력해주세요."),
  id: z.string().min(1, "이메일을 입력해주세요."),
});