import { Types, type ClientSession, type FilterQuery } from 'mongoose';
import { AppError } from '../errors/app-error.js';
import { BookingModel, type BookingDocument } from '../models/booking.model.js';
import { ServiceModel, type ServiceDocument } from '../models/service.model.js';
import type { BookingRecord, BookingStatus } from '../types/booking.types.js';
import type {
  BookingPage,
  BookingPeriod,
  BookingRepository,
  CreateBookingInput,
} from './interfaces/booking.repository.interface.js';
import {
  bookingEndDateFilter,
  calculateBookingTotal,
  countBookingDays,
} from '../services/booking-calculations.js';

function mapBooking(value: unknown): BookingRecord {
  const doc = value as BookingDocument & { _id?: Types.ObjectId | string; id?: string };
  return {
    id: doc.id ?? String(doc._id),
    userId: String(doc.userId),
    serviceId: String(doc.serviceId),
    startDate: new Date(doc.startDate),
    endDate: new Date(doc.endDate),
    numberOfDays: doc.numberOfDays,
    pricePerDay: doc.pricePerDay,
    totalPrice: doc.totalPrice,
    status: doc.status,
    ...(doc.contact ? { contact: { ...doc.contact } } : {}),
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

function utcDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function overlapsWindow(
  startDate: Date,
  endDate: Date,
  windows: ServiceDocument['unavailableDates'],
): boolean {
  const start = utcDate(startDate).getTime();
  const end = utcDate(endDate).getTime();
  return windows.some(
    (window) =>
      start <= utcDate(new Date(window.endDate)).getTime() &&
      end >= utcDate(new Date(window.startDate)).getTime(),
  );
}

function assertServiceAvailable(startDate: Date, endDate: Date, service: ServiceDocument): void {
  if (overlapsWindow(startDate, endDate, service.unavailableDates))
    throw new AppError(
      409,
      'DATES_UNAVAILABLE',
      'The service is unavailable for one or more requested dates',
    );
}

async function lockService(
  session: ClientSession,
  serviceId: string,
): Promise<ServiceDocument | null> {
  // This write makes competing availability checks conflict on the same service document.
  const result = await ServiceModel.findOneAndUpdate(
    { _id: serviceId },
    { $inc: { availabilityVersion: 1 } },
    { new: true, session },
  )
    .lean()
    .exec();
  return result as ServiceDocument | null;
}

async function assertNoConfirmedOverlap(
  serviceId: string,
  startDate: Date,
  endDate: Date,
  session: ClientSession,
  exceptId?: string,
): Promise<void> {
  const query: FilterQuery<BookingDocument> = {
    serviceId: new Types.ObjectId(serviceId),
    status: 'CONFIRMED',
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
    ...(exceptId ? { _id: { $ne: new Types.ObjectId(exceptId) } } : {}),
  };
  if (await BookingModel.exists(query).session(session))
    throw new AppError(409, 'BOOKING_CONFLICT', 'The requested dates overlap a confirmed booking');
}

export class MongoBookingRepository implements BookingRepository {
  async create(input: CreateBookingInput): Promise<BookingRecord> {
    const startDate = utcDate(input.startDate);
    const endDate = utcDate(input.endDate);
    const numberOfDays = countBookingDays(startDate, endDate);
    const session = await BookingModel.startSession();
    let created: BookingDocument | undefined;
    try {
      await session.withTransaction(
        async () => {
          const service = await lockService(session, input.serviceId);
          if (!service) throw new AppError(404, 'SERVICE_NOT_FOUND', 'Service was not found');
          if (!Number.isFinite(service.pricePerDay) || service.pricePerDay < 0)
            throw new AppError(
              422,
              'INVALID_SERVICE_PRICE',
              'The service has an invalid daily price',
            );
          assertServiceAvailable(startDate, endDate, service);
          await assertNoConfirmedOverlap(input.serviceId, startDate, endDate, session);
          const totalPrice = calculateBookingTotal(numberOfDays, service.pricePerDay);
          const docs = await BookingModel.create(
            [
              {
                userId: new Types.ObjectId(input.userId),
                serviceId: new Types.ObjectId(input.serviceId),
                startDate,
                endDate,
                numberOfDays,
                pricePerDay: service.pricePerDay,
                totalPrice,
                status: 'PENDING',
                ...(input.contact ? { contact: input.contact } : {}),
              },
            ],
            { session },
          );
          created = docs[0] as BookingDocument;
        },
        { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } },
      );
      if (!created) throw new Error('Booking transaction completed without creating a booking');
      return mapBooking(created);
    } finally {
      await session.endSession();
    }
  }

  async findMine(
    userId: string,
    period: BookingPeriod,
    page: number,
    limit: number,
    today: Date,
  ): Promise<BookingPage> {
    const query: FilterQuery<BookingDocument> = { userId: new Types.ObjectId(userId) };
    const endDate = bookingEndDateFilter(period, today);
    if (endDate) query.endDate = endDate;
    return this.findPage(query, page, limit);
  }

  async findForAdmin(adminId: string, page: number, limit: number): Promise<BookingPage> {
    const services = await ServiceModel.find({ createdBy: new Types.ObjectId(adminId) })
      .select('_id')
      .lean()
      .exec();
    return this.findPage(
      { serviceId: { $in: services.map((service) => service._id) } },
      page,
      limit,
    );
  }

  async cancelOwned(id: string, userId: string): Promise<BookingRecord | null> {
    return this.changeStatus(
      id,
      async (booking, _service, session) => {
        if (String(booking.userId) !== userId) return null;
        if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED')
          throw new AppError(
            409,
            'INVALID_STATUS_TRANSITION',
            'Only pending or confirmed bookings can be cancelled',
          );
        return BookingModel.findOneAndUpdate(
          { _id: id, userId, status: booking.status },
          { $set: { status: 'CANCELLED' } },
          { new: true, session },
        ).exec();
      },
      false,
    );
  }

  async setAdminStatus(
    id: string,
    adminId: string,
    status: BookingStatus,
  ): Promise<BookingRecord | null> {
    return this.changeStatus(
      id,
      async (booking, service, session) => {
        if (!service || String(service.createdBy) !== adminId) return null;
        const allowed: BookingStatus[] =
          booking.status === 'PENDING'
            ? ['CONFIRMED', 'CANCELLED']
            : booking.status === 'CONFIRMED'
              ? ['CANCELLED', 'COMPLETED']
              : [];
        if (!allowed.includes(status))
          throw new AppError(
            409,
            'INVALID_STATUS_TRANSITION',
            `Cannot change booking from ${booking.status} to ${status}`,
          );
        if (status === 'CONFIRMED') {
          const lockedService = await lockService(session, String(booking.serviceId));
          if (!lockedService) return null;
          assertServiceAvailable(booking.startDate, booking.endDate, lockedService);
          await assertNoConfirmedOverlap(
            String(booking.serviceId),
            booking.startDate,
            booking.endDate,
            session,
            id,
          );
        }
        return BookingModel.findOneAndUpdate(
          { _id: id, status: booking.status },
          { $set: { status } },
          { new: true, session },
        ).exec();
      },
      true,
    );
  }

  private async changeStatus(
    id: string,
    update: (
      booking: BookingDocument,
      service: ServiceDocument | null,
      session: ClientSession,
    ) => Promise<BookingDocument | null>,
    requiresService: boolean,
  ): Promise<BookingRecord | null> {
    const session = await BookingModel.startSession();
    let changed: BookingDocument | null = null;
    try {
      await session.withTransaction(
        async () => {
          const booking = await BookingModel.findById(id).session(session).exec();
          if (!booking) return;
          const service = await ServiceModel.findById(booking.serviceId).session(session).exec();
          if (!service && requiresService) return;
          changed = await update(booking, service, session);
        },
        { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } },
      );
      return changed ? mapBooking(changed) : null;
    } finally {
      await session.endSession();
    }
  }

  private async findPage(
    query: FilterQuery<BookingDocument>,
    page: number,
    limit: number,
  ): Promise<BookingPage> {
    const [items, total] = await Promise.all([
      BookingModel.find(query)
        .sort({ startDate: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      BookingModel.countDocuments(query).exec(),
    ]);
    return {
      items: items.map(mapBooking),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
