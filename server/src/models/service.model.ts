import { model, Schema } from 'mongoose';
import type { Types } from 'mongoose';
import { SERVICE_CATEGORIES, type ServiceRecord } from '../types/service.types.js';

export type ServiceDocument = Omit<ServiceRecord, 'id' | 'createdBy'> & {
  createdBy: Types.ObjectId;
  availabilityVersion: number;
};

const serviceSchema = new Schema<ServiceDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: SERVICE_CATEGORIES, required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    pricePerDay: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    images: { type: [String], required: true, default: [] },
    contactDetails: {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      phone: { type: String, required: true, trim: true, maxlength: 32 },
      email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    },
    unavailableDates: {
      type: [
        new Schema(
          {
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
          },
          { _id: false },
        ),
      ],
      required: true,
      default: [],
    },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    // Booking transactions increment this field to serialize availability checks.
    availabilityVersion: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false },
);

serviceSchema.index({ category: 1, location: 1, pricePerDay: 1 });
serviceSchema.index({ title: 'text', description: 'text' }, { name: 'service_keyword_search' });

export const ServiceModel = model<ServiceDocument>('Service', serviceSchema);
