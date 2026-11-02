import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from './app-error.js';
import { logger } from '../utils/logger.js';
import multer from 'multer';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  void _next;
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.issues,
      },
    });
    return;
  }
  if (error instanceof multer.MulterError) {
    response
      .status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400)
      .json({
        success: false,
        error: {
          code: error.code,
          message:
            error.code === 'LIMIT_FILE_SIZE'
              ? 'Each image must be 8 MB or smaller.'
              : 'The image upload limit was exceeded.',
        },
      });
    return;
  }
  if (env.NODE_ENV !== 'test') logger.error({ err: error }, 'Unhandled request error');
  response.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
    },
  });
};
