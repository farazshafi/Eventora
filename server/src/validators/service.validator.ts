import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../types/service.types.js';

const urlList = z.array(z.string().url().max(2048)).max(20);
const contact = z
  .object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(3).max(32),
    email: z.string().trim().email().max(254).optional(),
  })
  .strict();
const dateWindow = z
  .object({ startDate: z.coerce.date(), endDate: z.coerce.date() })
  .strict()
  .refine(
    ({ startDate, endDate }) => startDate <= endDate,
    'endDate must be on or after startDate',
  );
const unavailableDates = z
  .array(dateWindow)
  .max(100)
  .refine((windows) => {
    const ordered = [...windows].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    return ordered.every(
      (window, index) => index === 0 || ordered[index - 1]!.endDate < window.startDate,
    );
  }, 'Unavailable date windows must not overlap');

const fields = {
  title: z.string().trim().min(1).max(160),
  category: z.enum(SERVICE_CATEGORIES),
  description: z.string().trim().min(1).max(5000),
  pricePerDay: z.number().finite().min(0),
  location: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(500),
  images: urlList,
  contactDetails: contact,
  unavailableDates,
};

export const createServiceSchema = z.object(fields).strict();
export const updateServiceSchema = z
  .object(fields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');
export const serviceIdParamsSchema = z
  .object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid service id') })
  .strict();
const browseDate = z
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

export const browseServicesSchema = z
  .object({
    search: z.string().trim().min(1).max(120).optional(),
    category: z.enum(SERVICE_CATEGORIES).optional(),
    location: z.string().trim().min(1).max(120).optional(),
    minPrice: z.coerce.number().finite().min(0).optional(),
    maxPrice: z.coerce.number().finite().min(0).optional(),
    startDate: browseDate.optional(),
    endDate: browseDate.optional(),
    sortBy: z.enum(['price', 'title', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict()
  .refine(
    (value) =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    'minPrice must not exceed maxPrice',
  )
  .refine(
    (value) => (value.startDate === undefined) === (value.endDate === undefined),
    'startDate and endDate must be provided together',
  )
  .refine(
    (value) =>
      value.startDate === undefined ||
      value.endDate === undefined ||
      value.startDate <= value.endDate,
    'startDate must not exceed endDate',
  );
export const mineServicesSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type CreateServiceRequest = z.infer<typeof createServiceSchema>;
export type UpdateServiceRequest = z.infer<typeof updateServiceSchema>;
