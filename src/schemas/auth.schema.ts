import { z } from "zod";

export const loginSchema = z.object({
  id: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export const registerSchema = z.object({
  id: z.string().min(2, "아이디는 2자 이상이어야 합니다."),
  userName: z.string().min(1, "이름을 입력해주세요."),
  phone: z.string().regex(/^\d{10,11}$/, "올바른 전화번호를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh Token을 입력해주세요."),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh Token을 입력해주세요."),
});