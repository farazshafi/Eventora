import type { Request, Response } from 'express';
import type { BookingService } from '../services/booking.service.js';
import type { BookingStatus } from '../types/booking.types.js';
import type { BookingPeriod } from '../repositories/interfaces/booking.repository.interface.js';
import { sendSuccess } from '../utils/response.js';

export class BookingController {
  constructor(private readonly bookings: BookingService) {}
  create = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.bookings.create(request.body, request.auth!.sub), 201);
  mine = async (request: Request, response: Response): Promise<void> => {
    const query = request.validatedQuery as { period: BookingPeriod; page: number; limit: number };
    sendSuccess(
      response,
      await this.bookings.mine(request.auth!.sub, query.period, query.page, query.limit),
    );
  };
  admin = async (request: Request, response: Response): Promise<void> => {
    const query = request.validatedQuery as { page: number; limit: number };
    sendSuccess(response, await this.bookings.admin(request.auth!.sub, query.page, query.limit));
  };
  cancel = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.bookings.cancel(String(request.params.id), request.auth!.sub));
  setStatus = async (request: Request, response: Response): Promise<void> => {
    const { status } = request.body as { status: BookingStatus };
    sendSuccess(
      response,
      await this.bookings.setStatus(String(request.params.id), request.auth!.sub, status),
    );
  };
}
