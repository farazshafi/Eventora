import type { Response } from 'express';
interface SuccessResponse<T> {
  success: true;
  data: T;
}
export function sendSuccess<T>(response: Response, data: T, statusCode = 200): void {
  const body: SuccessResponse<T> = { success: true, data };
  response.status(statusCode).json(body);
}
