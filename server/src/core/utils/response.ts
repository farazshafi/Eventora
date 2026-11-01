import type { Response } from 'express';
import type { SuccessResponse } from '../interfaces/api-response.interface.js';
export function sendSuccess<T>(response: Response, data: T, statusCode = 200): void {
  const body: SuccessResponse<T> = { success: true, data };
  response.status(statusCode).json(body);
}
