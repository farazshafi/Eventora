import { z } from 'zod';

export const emailSchema = z.string().trim().email('Enter a valid email address.').max(254);
export const userNameSchema = z
  .string()
  .trim()
  .min(1, 'Enter your name.')
  .max(100)
  .regex(/^\p{L}[\p{L}\p{M}'’ -]*\p{L}$|^\p{L}$/u, 'Use letters, spaces, apostrophes, or hyphens.');
export const passwordSchema = z.string().max(128);
