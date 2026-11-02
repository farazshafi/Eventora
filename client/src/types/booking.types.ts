export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  pricePerDay: number;
  totalPrice: number;
  status: BookingStatus;
  contact?: { name?: string; phone?: string; email?: string };
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
