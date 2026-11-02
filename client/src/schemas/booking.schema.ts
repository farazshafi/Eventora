import { z } from 'zod';

export const bookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});
export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;

export const bookingContactSchema = z.object({
  name: z.string().trim().max(120).optional(),
  phone: z
    .string()
    .trim()
    .min(3, 'Enter a valid phone number.')
    .max(32)
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .max(254)
    .optional()
    .or(z.literal('')),
});

export type BookingContactInput = z.infer<typeof bookingContactSchema>;
