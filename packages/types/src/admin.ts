import { z } from "zod";

export const adminRoleEnum = z.enum(["OWNER", "OPERATOR", "VIEWER"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: adminRoleEnum.default("OPERATOR"),
});

export type AdminRole = z.infer<typeof adminRoleEnum>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
