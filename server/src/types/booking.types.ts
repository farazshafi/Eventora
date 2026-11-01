export const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export interface BookingContact {
  name?: string;
  phone?: string;
  email?: string;
}
export interface BookingRecord {
  id: string;
  userId: string;
  serviceId: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  pricePerDay: number;
  totalPrice: number;
  status: BookingStatus;
  contact?: BookingContact;
  createdAt: Date;
  updatedAt: Date;
}
