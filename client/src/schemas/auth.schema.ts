import { z } from 'zod';
import { emailSchema, passwordSchema, userNameSchema } from './user.schema';

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.min(1, 'Enter your password.'),
});

export const registerSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema.min(12, 'Use at least 12 characters.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
