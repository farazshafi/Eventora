import { axiosInstance, getData } from './axios';
import type { ApiSuccess } from '../types/api.types';
import type { Booking, Page } from '../types/booking.types';
import type { BookingStatus } from '../types/booking.types';
import type { BookingContactInput } from '../schemas/booking.schema';

export const getMyBookings = (period: 'upcoming' | 'past' | 'all' = 'upcoming', page = 1) =>
  getData(
    axiosInstance.get<ApiSuccess<Page<Booking>>>('/bookings/my', {
      params: { period, page, limit: 10 },
      requiresAuth: true,
    }),
  );

export const createBooking = (input: {
  serviceId: string;
  startDate: string;
  endDate: string;
  contact?: BookingContactInput;
}) => getData(axiosInstance.post<ApiSuccess<Booking>>('/bookings', input, { requiresAuth: true }));

export const cancelBooking = (id: string) =>
  getData(
    axiosInstance.patch<ApiSuccess<Booking>>(
      `/bookings/${encodeURIComponent(id)}/cancel`,
      undefined,
      { requiresAuth: true },
    ),
  );

export const getAdminBookingsPage = (page = 1, limit = 100) =>
  getData(
    axiosInstance.get<ApiSuccess<Page<Booking>>>('/bookings/admin', {
      params: { page, limit },
      requiresAuth: true,
    }),
  );

export const setAdminBookingStatus = (id: string, status: BookingStatus) =>
  getData(
    axiosInstance.patch<ApiSuccess<Booking>>(
      `/bookings/${encodeURIComponent(id)}/status`,
      { status },
      { requiresAuth: true },
    ),
  );
