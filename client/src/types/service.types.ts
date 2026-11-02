export const serviceCategories = [
  'MARRIAGE_VENUE',
  'HOTEL',
  'CATERER',
  'PHOTOGRAPHER',
  'CAMERAMAN',
  'DJ',
  'OTHER',
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

export interface Service {
  id: string;
  title: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  pricePerDay: number;
  location: string;
  address: string;
  images: string[];
  contactDetails: { name: string; phone: string; email?: string };
  unavailableDates: { startDate: string; endDate: string }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePage {
  services: Service[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export interface AdminServicePage {
  items: Service[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
