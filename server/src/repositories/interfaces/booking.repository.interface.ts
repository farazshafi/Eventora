import type {
  BookingContact,
  BookingRecord,
  BookingStatus,
  BookingStatusChange,
} from '../../types/booking.types.js';
export interface CreateBookingInput {
  userId: string;
  serviceId: string;
  startDate: Date;
  endDate: Date;
  contact?: BookingContact;
}
export interface BookingPage {
  items: BookingRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export type BookingPeriod = 'upcoming' | 'past' | 'all';
export interface AdminBookingFilters {
  search?: string;
  status?: BookingStatus;
}
export interface BookingRepository {
  create(input: CreateBookingInput): Promise<BookingRecord>;
  findMine(
    userId: string,
    period: BookingPeriod,
    page: number,
    limit: number,
    today: Date,
  ): Promise<BookingPage>;
  findForAdmin(
    adminId: string,
    page: number,
    limit: number,
    filters: AdminBookingFilters,
  ): Promise<BookingPage>;
  cancelOwned(id: string, userId: string): Promise<BookingRecord | null>;
  setAdminStatus(
    id: string,
    adminId: string,
    status: BookingStatus,
  ): Promise<BookingStatusChange | null>;
}
