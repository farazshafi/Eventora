import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (request, response) => {
    const requestId = request.headers['x-request-id'];
    const id = typeof requestId === 'string' && requestId.length <= 128 ? requestId : randomUUID();
    response.setHeader('x-request-id', id);
    return id;
  },
  customLogLevel: (_request, response, error) =>
    error || response.statusCode >= 500 ? 'error' : response.statusCode >= 400 ? 'warn' : 'info',
});
