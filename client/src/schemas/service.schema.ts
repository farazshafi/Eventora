import { z } from 'zod';
import { serviceCategories } from '../types/service.types';

const managedDateWindows = z
  .array(
    z
      .object({
        startDate: z.string().min(1, 'Choose a start date.'),
        endDate: z.string().min(1, 'Choose an end date.'),
      })
      .refine((window) => window.startDate <= window.endDate, {
        path: ['endDate'],
        message: 'End date must be on or after start date.',
      }),
  )
  .max(100)
  .refine((windows) => {
    const sorted = [...windows].sort((a, b) => a.startDate.localeCompare(b.startDate));
    return sorted.every(
      (window, index) => index === 0 || sorted[index - 1]!.endDate < window.startDate,
    );
  }, 'Unavailable date ranges cannot overlap.');

export const managedServiceSchema = z
  .object({
    title: z.string().trim().min(1, 'Enter a service name.').max(160),
    category: z.enum(serviceCategories),
    description: z.string().trim().min(1, 'Add a description.').max(5000),
    pricePerDay: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid daily price.')
      .transform(Number),
    location: z.string().trim().min(1).max(120),
    address: z.string().trim().min(1).max(500),
    images: z.array(z.string().url('Image upload failed.').max(2048)).max(20),
    contactDetails: z.object({
      name: z.string().trim().min(1).max(120),
      phone: z.string().trim().min(3).max(32),
      email: z
        .union([z.literal(''), z.string().trim().email().max(254)])
        .optional()
        .transform((value) => value || undefined),
    }),
    unavailableDates: managedDateWindows,
  })
  .transform((value) => ({
    ...value,
    unavailableDates: value.unavailableDates.map(({ startDate, endDate }) => ({
      startDate: `${startDate}T00:00:00.000Z`,
      endDate: `${endDate}T00:00:00.000Z`,
    })),
  }));

export type ManagedServiceFormInput = z.input<typeof managedServiceSchema>;
export type ManagedServiceFormOutput = z.output<typeof managedServiceSchema>;

export const serviceFiltersSchema = z
  .object({
    search: z.string().max(120).optional(),
    category: z.enum(serviceCategories).or(z.literal('')).optional(),
    location: z.string().max(120).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sort: z.enum(['recent', 'price-low', 'price-high', 'title']).default('recent'),
  })
  .refine(
    (value) =>
      !value.minPrice || !value.maxPrice || Number(value.minPrice) <= Number(value.maxPrice),
    {
      path: ['maxPrice'],
      message: 'Maximum price should be above minimum price.',
    },
  )
  .refine((value) => Boolean(value.startDate) === Boolean(value.endDate), {
    path: ['endDate'],
    message: 'Choose both dates to filter availability.',
  });

export type ServiceFiltersInput = z.input<typeof serviceFiltersSchema>;
