import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/errors/app-error.js';
import type { BookingRepository } from '../src/repositories/interfaces/booking.repository.interface.js';
import { BookingService } from '../src/services/booking.service.js';
import {
  bookingEndDateFilter,
  calculateBookingTotal,
  countBookingDays,
} from '../src/services/booking-calculations.js';
import { createBookingSchema } from '../src/validators/booking.validator.js';
import type { BookingRecord } from '../src/types/booking.types.js';

const booking: BookingRecord = {
  id: '507f1f77bcf86cd799439012',
  userId: 'user-1',
  serviceId: '507f1f77bcf86cd799439011',
  startDate: new Date('2026-12-01T00:00:00Z'),
  endDate: new Date('2026-12-03T00:00:00Z'),
  numberOfDays: 3,
  pricePerDay: 1200,
  totalPrice: 3600,
  status: 'PENDING',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function setup() {
  const repo: BookingRepository = {
    create: vi.fn(async (input) => ({
      ...booking,
      userId: input.userId,
      serviceId: input.serviceId,
      startDate: input.startDate,
      endDate: input.endDate,
    })),
    findMine: vi.fn(async () => ({
      items: [booking],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })),
    findForAdmin: vi.fn(async () => ({
      items: [booking],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })),
    cancelOwned: vi.fn(async (id, userId) =>
      id === booking.id && userId === booking.userId ? { ...booking, status: 'CANCELLED' } : null,
    ),
    setAdminStatus: vi.fn(async (id, adminId, status) =>
      id === booking.id && adminId === 'admin-1' ? { ...booking, status } : null,
    ),
  };
  return { repo, service: new BookingService(repo) };
}

describe('booking calculations', () => {
  it('counts UTC calendar days inclusively, including a same-day booking', () => {
    expect(
      countBookingDays(new Date('2026-01-01T20:00:00Z'), new Date('2026-01-01T02:00:00Z')),
    ).toBe(1);
    expect(
      countBookingDays(new Date('2026-01-01T00:00:00Z'), new Date('2026-01-03T00:00:00Z')),
    ).toBe(3);
  });
  it('calculates total price and rejects invalid dates or prices', () => {
    expect(calculateBookingTotal(3, 125.5)).toBe(376.5);
    expect(() => countBookingDays(new Date('2026-01-02'), new Date('2026-01-01'))).toThrow(
      AppError,
    );
    expect(() => calculateBookingTotal(2, Number.POSITIVE_INFINITY)).toThrow(AppError);
  });
  it('classifies bookings ending today as upcoming and prior end dates as past', () => {
    const today = new Date('2026-12-03T19:00:00Z');
    expect(bookingEndDateFilter('upcoming', today)).toEqual({
      $gte: new Date('2026-12-03T00:00:00Z'),
    });
    expect(bookingEndDateFilter('past', today)).toEqual({ $lt: new Date('2026-12-03T00:00:00Z') });
    expect(bookingEndDateFilter('all', today)).toBeUndefined();
  });
});

describe('BookingService authorization and input handling', () => {
  it('derives userId from the authenticated caller and forwards only booking inputs', async () => {
    const { repo, service } = setup();
    await service.create(
      { serviceId: booking.serviceId, startDate: booking.startDate, endDate: booking.endDate },
      'user-7',
    );
    expect(repo.create).toHaveBeenCalledWith({
      serviceId: booking.serviceId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      userId: 'user-7',
    });
  });
  it('rejects attempts to inject user or price values at request validation', () => {
    const valid = { serviceId: booking.serviceId, startDate: '2026-12-01', endDate: '2026-12-03' };
    expect(() => createBookingSchema.parse({ ...valid, userId: 'someone-else' })).toThrow();
    expect(() => createBookingSchema.parse({ ...valid, pricePerDay: 1 })).toThrow();
    expect(() => createBookingSchema.parse({ ...valid, startDate: '2026-02-30' })).toThrow();
    expect(() =>
      createBookingSchema.parse({ ...valid, startDate: '2026-12-03', endDate: '2026-12-01' }),
    ).toThrow();
  });
  it('does not modify another user booking and propagates booking conflict errors', async () => {
    const { repo, service } = setup();
    await expect(service.cancel(booking.id, 'user-2')).rejects.toMatchObject({
      statusCode: 404,
      code: 'BOOKING_NOT_FOUND',
    });
    vi.mocked(repo.create).mockRejectedValue(new AppError(409, 'BOOKING_CONFLICT', 'Conflict'));
    await expect(
      service.create(
        { serviceId: booking.serviceId, startDate: booking.startDate, endDate: booking.endDate },
        'user-1',
      ),
    ).rejects.toMatchObject({ statusCode: 409, code: 'BOOKING_CONFLICT' });
  });
  it('scopes admin status changes to the caller id', async () => {
    const { repo, service } = setup();
    await expect(service.setStatus(booking.id, 'admin-2', 'CONFIRMED')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(repo.setAdminStatus).toHaveBeenCalledWith(booking.id, 'admin-2', 'CONFIRMED');
  });
});
