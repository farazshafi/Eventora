import { z } from 'zod';
import { BOOKING_STATUSES } from '../types/booking.types.js';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD')
  .transform((value, context) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      context.addIssue({ code: 'custom', message: 'Date must be a valid calendar date' });
      return z.NEVER;
    }
    return date;
  });

const contact = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().min(3).max(32).optional(),
    email: z.string().trim().email().max(254).optional(),
  })
  .strict();

export const createBookingSchema = z
  .object({
    serviceId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid service id'),
    startDate: isoDate,
    endDate: isoDate,
    contact: contact.optional(),
  })
  .strict()
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    path: ['endDate'],
    message: 'endDate must be the same as or after startDate',
  });

export const bookingIdParamsSchema = z
  .object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid booking id') })
  .strict();
export const bookingPeriodSchema = z.enum(['upcoming', 'past', 'all']).default('upcoming');
export const bookingListQuerySchema = z
  .object({
    period: bookingPeriodSchema,
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
export const bookingAdminQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
export const bookingStatusSchema = z.object({ status: z.enum(BOOKING_STATUSES) }).strict();

export type CreateBookingRequest = z.infer<typeof createBookingSchema>;
