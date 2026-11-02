import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^\p{L}[\p{L}\p{M}'’ -]*\p{L}$|^\p{L}$/u, 'Enter a valid name.'),
    password: z.string().min(12).max(128),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export const verifyEmailSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    code: z.string().regex(/^\d{6}$/),
  })
  .strict();
export const resendVerificationSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
  })
  .strict();
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
