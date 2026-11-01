import { AppError } from '../errors/app-error.js';

export function countBookingDays(startDate: Date, endDate: Date): number {
  const start = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
  const end = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  const days = Math.floor((end - start) / 86_400_000) + 1;
  if (!Number.isSafeInteger(days) || days < 1)
    throw new AppError(
      400,
      'INVALID_BOOKING_DATES',
      'endDate must be the same as or after startDate',
    );
  return days;
}

export function calculateBookingTotal(numberOfDays: number, pricePerDay: number): number {
  if (
    !Number.isSafeInteger(numberOfDays) ||
    numberOfDays < 1 ||
    !Number.isFinite(pricePerDay) ||
    pricePerDay < 0
  )
    throw new AppError(
      400,
      'INVALID_BOOKING_TOTAL',
      'The booking duration or daily price is invalid',
    );
  const total = numberOfDays * pricePerDay;
  if (!Number.isFinite(total) || total < 0)
    throw new AppError(400, 'INVALID_BOOKING_TOTAL', 'The calculated booking total is invalid');
  return total;
}

export function bookingEndDateFilter(
  period: 'upcoming' | 'past' | 'all',
  today: Date,
): { $gte: Date } | { $lt: Date } | undefined {
  const utcToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  if (period === 'upcoming') return { $gte: utcToday };
  if (period === 'past') return { $lt: utcToday };
  return undefined;
}
