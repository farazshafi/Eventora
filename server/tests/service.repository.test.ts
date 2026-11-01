import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookingModel } from '../src/models/booking.model.js';
import { ServiceModel } from '../src/models/service.model.js';
import { MongoServiceRepository } from '../src/repositories/service.repository.js';

afterEach(() => vi.restoreAllMocks());

const filters = {
  search: 'marriage',
  category: 'MARRIAGE_VENUE' as const,
  minPrice: 5000,
  maxPrice: 50000,
  location: 'Kochi',
  page: 2,
  limit: 12,
  sortBy: 'price' as const,
  sortOrder: 'asc' as const,
};

describe('MongoServiceRepository discovery', () => {
  it('combines search and service filters before MongoDB sorting and pagination', async () => {
    const find = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    });
    const sort = vi.fn().mockReturnThis();
    const skip = vi.fn().mockReturnThis();
    const limit = vi.fn().mockReturnThis();
    const exec = vi.fn().mockResolvedValue([]);
    find.mockReturnValue({ sort, skip, limit, lean: () => ({ exec }) });
    vi.spyOn(ServiceModel, 'find').mockImplementation(find as never);
    vi.spyOn(ServiceModel, 'countDocuments').mockReturnValue({
      exec: vi.fn().mockResolvedValue(0),
    } as never);

    const result = await new MongoServiceRepository().browse(filters);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        $text: { $search: 'marriage' },
        category: 'MARRIAGE_VENUE',
        location: { $regex: 'Kochi', $options: 'i' },
        pricePerDay: { $gte: 5000, $lte: 50000 },
      }),
    );
    expect(sort).toHaveBeenCalledWith({ pricePerDay: 1, _id: 1 });
    expect(skip).toHaveBeenCalledWith(12);
    expect(limit).toHaveBeenCalledWith(12);
    expect(result).toMatchObject({
      services: [],
      currentPage: 2,
      totalPages: 0,
      totalItems: 0,
      limit: 12,
    });
  });

  it('filters inclusive unavailable and confirmed booking overlaps before counting and paging', async () => {
    const startDate = new Date('2026-12-10T00:00:00.000Z');
    const endDate = new Date('2026-12-12T00:00:00.000Z');
    const aggregate = vi.spyOn(ServiceModel, 'aggregate').mockReturnValue({
      exec: vi.fn().mockResolvedValue([{ services: [], metadata: [{ totalItems: 0 }] }]),
    } as never);

    const result = await new MongoServiceRepository().browse({
      ...filters,
      startDate,
      endDate,
    });

    const pipeline = aggregate.mock.calls[0]![0] as Array<Record<string, unknown>>;
    expect(pipeline[0]).toMatchObject({
      $match: expect.objectContaining({
        $nor: [
          {
            unavailableDates: {
              $elemMatch: { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
            },
          },
        ],
      }),
    });
    expect(pipeline[1]).toMatchObject({
      $lookup: {
        from: BookingModel.collection.name,
        localField: '_id',
        foreignField: 'serviceId',
        as: 'confirmedBookings',
        pipeline: [
          {
            $match: {
              status: 'CONFIRMED',
              startDate: { $lte: endDate },
              endDate: { $gte: startDate },
            },
          },
          { $limit: 1 },
        ],
      },
    });
    expect(pipeline[2]).toEqual({ $match: { confirmedBookings: { $eq: [] } } });
    expect(pipeline[3]).toHaveProperty('$facet.metadata');
    expect(result).toMatchObject({ services: [], currentPage: 2, totalItems: 0, limit: 12 });
  });
});
