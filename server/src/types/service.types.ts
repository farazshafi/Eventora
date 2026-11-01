export const SERVICE_CATEGORIES = [
  'MARRIAGE_VENUE',
  'HOTEL',
  'CATERER',
  'PHOTOGRAPHER',
  'CAMERAMAN',
  'DJ',
  'OTHER',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface ServiceContactDetails {
  name: string;
  phone: string;
  email?: string;
}

export interface UnavailableDateWindow {
  startDate: Date;
  endDate: Date;
}

export interface ServiceRecord {
  id: string;
  title: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  pricePerDay: number;
  location: string;
  address: string;
  images: string[];
  contactDetails: ServiceContactDetails;
  unavailableDates: UnavailableDateWindow[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
