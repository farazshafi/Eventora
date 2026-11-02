import type { ServiceCategory } from '../types/service.types';

export const categoryLabels: Record<ServiceCategory, string> = {
  MARRIAGE_VENUE: 'Wedding venues',
  HOTEL: 'Hotels',
  CATERER: 'Catering',
  PHOTOGRAPHER: 'Photography',
  CAMERAMAN: 'Videography',
  DJ: 'DJs & music',
  OTHER: 'Event essentials',
};
export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
export const dayCount = (start: string, end: string) =>
  Math.floor((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;
