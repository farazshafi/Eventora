import pino from 'pino';
import { env } from '../../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  base: { service: 'event-booking-api', environment: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
});
