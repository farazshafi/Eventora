import { Types, type FilterQuery } from 'mongoose';
import { BookingModel } from '../models/booking.model.js';
import { ServiceModel, type ServiceDocument } from '../models/service.model.js';
import type { ServiceRecord } from '../types/service.types.js';
import type {
  CreateServiceInput,
  ServiceFilters,
  ServicePage,
  ServiceRepository,
  ServiceSearchPage,
  UpdateServiceInput,
} from './interfaces/service.repository.interface.js';

function mapService(value: unknown): ServiceRecord {
  const doc = value as ServiceDocument & { _id?: Types.ObjectId | string; id?: string };
  return {
    id: doc.id ?? String(doc._id),
    title: doc.title,
    slug: doc.slug,
    category: doc.category,
    description: doc.description,
    pricePerDay: doc.pricePerDay,
    location: doc.location,
    address: doc.address,
    images: doc.images,
    contactDetails: doc.contactDetails,
    unavailableDates: doc.unavailableDates.map((range) => ({
      startDate: new Date(range.startDate),
      endDate: new Date(range.endDate),
    })),
    createdBy: String(doc.createdBy),
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export class MongoServiceRepository implements ServiceRepository {
  async create(input: CreateServiceInput, slug: string): Promise<ServiceRecord> {
    return mapService(await ServiceModel.create({ ...input, slug }));
  }
  async findById(id: string): Promise<ServiceRecord | null> {
    const service = await ServiceModel.findById(id).lean().exec();
    return service ? mapService(service) : null;
  }
  async browse(filters: ServiceFilters): Promise<ServiceSearchPage> {
    const query: FilterQuery<ServiceDocument> = {};
    if (filters.search) query.$text = { $search: filters.search };
    if (filters.category) query.category = filters.category;
    if (filters.location) query.location = { $regex: escapeRegex(filters.location), $options: 'i' };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.pricePerDay = {
        ...(filters.minPrice === undefined ? {} : { $gte: filters.minPrice }),
        ...(filters.maxPrice === undefined ? {} : { $lte: filters.maxPrice }),
      };
    }
    const sortField = filters.sortBy === 'price' ? 'pricePerDay' : filters.sortBy;
    const sortDirection: 1 | -1 = filters.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection, _id: sortDirection };
    if (!filters.startDate || !filters.endDate) {
      const [results, totalItems] = await Promise.all([
        ServiceModel.find(query)
          .sort(sort)
          .skip((filters.page - 1) * filters.limit)
          .limit(filters.limit)
          .lean()
          .exec(),
        ServiceModel.countDocuments(query).exec(),
      ]);
      return {
        services: results.map(mapService),
        currentPage: filters.page,
        totalPages: Math.ceil(totalItems / filters.limit),
        totalItems,
        limit: filters.limit,
      };
    }

    const overlapWindow = {
      startDate: { $lte: filters.endDate },
      endDate: { $gte: filters.startDate },
    };
    const [result] = await ServiceModel.aggregate<{
      services: Array<ServiceDocument & { _id: Types.ObjectId }>;
      metadata: Array<{ totalItems: number }>;
    }>([
      { $match: { ...query, $nor: [{ unavailableDates: { $elemMatch: overlapWindow } }] } },
      {
        $lookup: {
          from: BookingModel.collection.name,
          localField: '_id',
          foreignField: 'serviceId',
          pipeline: [{ $match: { status: 'CONFIRMED', ...overlapWindow } }, { $limit: 1 }],
          as: 'confirmedBookings',
        },
      },
      { $match: { confirmedBookings: { $eq: [] } } },
      {
        $facet: {
          services: [
            { $sort: sort },
            { $skip: (filters.page - 1) * filters.limit },
            { $limit: filters.limit },
            { $project: { confirmedBookings: 0 } },
          ],
          metadata: [{ $count: 'totalItems' }],
        },
      },
    ]).exec();
    const totalItems = result?.metadata[0]?.totalItems ?? 0;
    return {
      services: (result?.services ?? []).map(mapService),
      currentPage: filters.page,
      totalPages: Math.ceil(totalItems / filters.limit),
      totalItems,
      limit: filters.limit,
    };
  }
  async findByCreator(createdBy: string, page: number, limit: number): Promise<ServicePage> {
    return this.findPage({ createdBy: new Types.ObjectId(createdBy) }, page, limit);
  }
  async updateOwned(
    id: string,
    createdBy: string,
    updates: UpdateServiceInput,
    slug?: string,
  ): Promise<ServiceRecord | null> {
    const fields = slug === undefined ? updates : { ...updates, slug };
    const result = await ServiceModel.findOneAndUpdate(
      { _id: id, createdBy: new Types.ObjectId(createdBy) },
      { $set: fields },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
    return result ? mapService(result) : null;
  }
  async deleteOwned(id: string, createdBy: string): Promise<boolean> {
    const result = await ServiceModel.deleteOne({
      _id: id,
      createdBy: new Types.ObjectId(createdBy),
    }).exec();
    return result.deletedCount > 0;
  }
  private async findPage(
    query: FilterQuery<ServiceDocument>,
    page: number,
    limit: number,
  ): Promise<ServicePage> {
    const [results, total] = await Promise.all([
      ServiceModel.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      ServiceModel.countDocuments(query).exec(),
    ]);
    return {
      items: results.map(mapService),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
