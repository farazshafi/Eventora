import { model, Schema } from 'mongoose';
import type { Types } from 'mongoose';
import { BOOKING_STATUSES, type BookingRecord } from '../types/booking.types.js';

export type BookingDocument = Omit<BookingRecord, 'id' | 'userId' | 'serviceId'> & {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
};

const bookingSchema = new Schema<BookingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    serviceId: { type: Schema.Types.ObjectId, required: true, ref: 'Service', index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true, min: 1 },
    pricePerDay: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      required: true,
      default: 'PENDING',
      index: true,
    },
    contact: {
      name: { type: String, trim: true, maxlength: 120 },
      phone: { type: String, trim: true, maxlength: 32 },
      email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    },
  },
  { timestamps: true, versionKey: false },
);
bookingSchema.index({ serviceId: 1, status: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ userId: 1, startDate: -1, _id: -1 });
export const BookingModel = model<BookingDocument>('Booking', bookingSchema);
