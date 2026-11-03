import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/errors/app-error.js';
import { BookingModel } from '../src/models/booking.model.js';
import { ServiceModel, type ServiceDocument } from '../src/models/service.model.js';
import { MongoBookingRepository } from '../src/repositories/booking.repository.js';

const serviceId = '507f1f77bcf86cd799439011';
const userId = '507f1f77bcf86cd799439012';
const service = {
  _id: new Types.ObjectId(serviceId),
  createdBy: new Types.ObjectId('507f1f77bcf86cd799439013'),
  pricePerDay: 125,
  unavailableDates: [],
  availabilityVersion: 1,
} as unknown as ServiceDocument;

function setup(overrides: { service?: ServiceDocument | null; overlap?: boolean } = {}) {
  const session = {
    withTransaction: vi.fn(async (callback: () => Promise<void>) => callback()),
    endSession: vi.fn(async () => undefined),
  };
  vi.spyOn(BookingModel, 'startSession').mockResolvedValue(session as never);
  const serviceQuery = {
    lean: () => ({
      exec: async () => (overrides.service === undefined ? service : overrides.service),
    }),
  };
  const serviceWrite = vi
    .spyOn(ServiceModel, 'findOneAndUpdate')
    .mockReturnValue(serviceQuery as never);
  const overlapQuery = {
    session: async () => (overrides.overlap ? { _id: new Types.ObjectId() } : null),
  };
  const exists = vi.spyOn(BookingModel, 'exists').mockReturnValue(overlapQuery as never);
  const created = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(userId),
    serviceId: new Types.ObjectId(serviceId),
    startDate: new Date('2026-12-01'),
    endDate: new Date('2026-12-03'),
    numberOfDays: 3,
    pricePerDay: 125,
    totalPrice: 375,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const create = vi.spyOn(BookingModel, 'create').mockResolvedValue([created] as never);
  return { session, serviceWrite, exists, create };
}

afterEach(() => vi.restoreAllMocks());

describe('MongoBookingRepository availability transactions', () => {
  it('filters admin bookings by status and searchable customer and booking fields before paging', async () => {
    const adminId = '507f1f77bcf86cd799439013';
    vi.spyOn(ServiceModel, 'find').mockReturnValue({
      select: () => ({
        lean: () => ({ exec: async () => [{ _id: new Types.ObjectId(serviceId) }] }),
      }),
    } as never);
    const skip = vi.fn().mockReturnThis();
    const limit = vi.fn().mockReturnThis();
    const exec = vi.fn().mockResolvedValue([]);
    const find = vi.spyOn(BookingModel, 'find').mockReturnValue({
      sort: () => ({ skip, limit, lean: () => ({ exec }) }),
    } as never);
    vi.spyOn(BookingModel, 'countDocuments').mockReturnValue({
      exec: vi.fn().mockResolvedValue(0),
    } as never);

    await new MongoBookingRepository().findForAdmin(adminId, 2, 10, {
      search: 'alice',
      status: 'CONFIRMED',
    });

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CONFIRMED',
        $or: expect.arrayContaining([
          { 'contact.name': { $regex: 'alice', $options: 'i' } },
          { 'contact.email': { $regex: 'alice', $options: 'i' } },
          { 'contact.phone': { $regex: 'alice', $options: 'i' } },
        ]),
      }),
    );
    expect(skip).toHaveBeenCalledWith(10);
    expect(limit).toHaveBeenCalledWith(10);
  });

  it('serializes availability checks on the service and snapshots a calculated quote', async () => {
    const mocks = setup();
    const result = await new MongoBookingRepository().create({
      userId,
      serviceId,
      startDate: new Date('2026-12-01'),
      endDate: new Date('2026-12-03'),
    });
    expect(result).toMatchObject({
      numberOfDays: 3,
      pricePerDay: 125,
      totalPrice: 375,
      status: 'PENDING',
    });
    expect(mocks.serviceWrite).toHaveBeenCalledWith(
      { _id: serviceId },
      { $inc: { availabilityVersion: 1 } },
      expect.objectContaining({ session: expect.anything() }),
    );
    expect(mocks.session.withTransaction).toHaveBeenCalledOnce();
    expect(mocks.exists).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'CONFIRMED', serviceId: expect.any(Types.ObjectId) }),
    );
  });

  it('rejects an overlap with a confirmed booking inside the transaction', async () => {
    const mocks = setup({ overlap: true });
    await expect(
      new MongoBookingRepository().create({
        userId,
        serviceId,
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-12-03'),
      }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'BOOKING_CONFLICT' });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.session.endSession).toHaveBeenCalledOnce();
  });

  it('rejects unavailable dates without creating a booking', async () => {
    const unavailable = {
      ...service,
      unavailableDates: [{ startDate: new Date('2026-12-02'), endDate: new Date('2026-12-05') }],
    } as ServiceDocument;
    const mocks = setup({ service: unavailable });
    await expect(
      new MongoBookingRepository().create({
        userId,
        serviceId,
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-12-03'),
      }),
    ).rejects.toBeInstanceOf(AppError);
    expect(mocks.exists).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
