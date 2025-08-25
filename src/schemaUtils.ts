import { z } from "zod";

const userName = z
  .string()
  .nonempty("用户名是必填项")
  .min(4, "用户名至少需要 4 个字符")
  .max(15, "用户名最多 15 个字符")
  .refine((v) => v.toLocaleLowerCase() !== "none", {
    message: "用户名称不能是 None",
  })
  .regex(/^[a-zA-Z0-9-]+$/, "用户名称只能包含 a-zA-Z0-9-");
const displayName = z
  .string()
  .nonempty("昵称是必填项")
  .min(2, "昵称至少需要 2 个字符")
  .max(15, "昵称最多 15 个字符")
  .regex(/^[^<>\\/+"]+$/, '昵称不能包含特殊字符: <>/+"');

export const registerSchema = z.object({
  userName: userName,
  displayName: displayName,
});

export type RegisterInfo = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  userName: userName,
});

export type LoginInfo = z.infer<typeof loginSchema>;
