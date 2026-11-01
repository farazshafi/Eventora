import { z } from 'zod';
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'unavailable']),
  timestamp: z.string().datetime(),
  uptime: z.number().nonnegative(),
  database: z.enum(['ready', 'unavailable']),
});
