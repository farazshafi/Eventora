import { Types } from 'mongoose';
import { AppError } from '../errors/app-error.js';
import type {
  BookingRepository,
  BookingPeriod,
  CreateBookingInput,
} from '../repositories/interfaces/booking.repository.interface.js';
import type { BookingRecord, BookingStatus } from '../types/booking.types.js';
import { countBookingDays } from './booking-calculations.js';

export class BookingService {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly notifications?: {
      created(booking: BookingRecord): Promise<void>;
      statusChanged(booking: BookingRecord & { previousStatus?: BookingStatus }): Promise<void>;
    },
  ) {}

  async create(input: Omit<CreateBookingInput, 'userId'>, userId: string): Promise<BookingRecord> {
    const startDate = normalizeDate(input.startDate);
    const endDate = normalizeDate(input.endDate);
    countBookingDays(startDate, endDate);
    if (!Types.ObjectId.isValid(input.serviceId))
      throw new AppError(400, 'INVALID_SERVICE_ID', 'Service id is invalid');
    const booking = await this.persist(() =>
      this.bookings.create({ ...input, startDate, endDate, userId }),
    );
    await this.notify(() => this.notifications?.created(booking));
    return booking;
  }

  mine(
    userId: string,
    period: BookingPeriod,
    page: number,
    limit: number,
  ): Promise<Awaited<ReturnType<BookingRepository['findMine']>>> {
    return this.bookings.findMine(userId, period, page, limit, utcToday());
  }

  admin(
    adminId: string,
    page: number,
    limit: number,
  ): Promise<Awaited<ReturnType<BookingRepository['findForAdmin']>>> {
    return this.bookings.findForAdmin(adminId, page, limit);
  }

  async cancel(id: string, userId: string): Promise<BookingRecord> {
    const booking = await this.persist(() => this.bookings.cancelOwned(id, userId));
    if (!booking) throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking was not found');
    return booking;
  }

  async setStatus(id: string, adminId: string, status: BookingStatus): Promise<BookingRecord> {
    const booking = await this.persist(() => this.bookings.setAdminStatus(id, adminId, status));
    if (!booking) throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking was not found');
    await this.notify(() => this.notifications?.statusChanged(booking));
    return booking;
  }

  private async persist<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError')
        throw new AppError(400, 'INVALID_BOOKING_ID', 'Booking id is invalid');
      throw error;
    }
  }
  private async notify(action: () => Promise<void> | undefined): Promise<void> {
    try {
      await action();
    } catch (error) {
      console.error('Booking notification email failed', error);
    }
  }
}

export function normalizeDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function utcToday(): Date {
  return normalizeDate(new Date());
}
