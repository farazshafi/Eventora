import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const optionalEmail = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().email().optional(),
);
const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
);
const optionalSender = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z
    .string()
    .regex(/^.+\s<[^<>\s]+@[^<>\s]+>$/, 'RESEND_FROM must use the format Name <email@domain>')
    .optional(),
);

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI cannot be empty'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters'),
  JWT_ISSUER: z.string().default('eventora-api'),
  JWT_AUDIENCE: z.string().default('eventora-client'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RESEND_API_KEY: optionalString,
  RESEND_FROM: optionalSender,
  ADMIN_EMAIL: optionalEmail,
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});
const result = environmentSchema.safeParse(process.env);
if (!result.success) {
  const details = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid server environment configuration: ${details.join('; ')}`);
}
export const env = result.data;
