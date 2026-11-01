import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests; please try again later' },
  },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'AUTH_RATE_LIMITED', message: 'Too many authentication attempts' },
  },
});
