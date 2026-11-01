import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/errors/app-error.js';
import type { ServiceRecord } from '../src/types/service.types.js';
import type { ServiceRepository } from '../src/repositories/interfaces/service.repository.interface.js';
import { ServiceService, slugify } from '../src/services/service.service.js';
import { createServiceSchema, updateServiceSchema } from '../src/validators/service.validator.js';

const service: ServiceRecord = {
  id: '507f1f77bcf86cd799439011', title: 'Garden Hall', slug: 'garden-hall', category: 'MARRIAGE_VENUE',
  description: 'Venue', pricePerDay: 1200, location: 'Pune', address: 'Main Road', images: [],
  contactDetails: { name: 'Host', phone: '123456789' }, unavailableDates: [], createdBy: 'admin-1',
  createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
};

function setup() {
  const repo: ServiceRepository = {
    create: vi.fn(async (input, slug) => ({ ...service, ...input, slug })),
    findById: vi.fn(async () => service),
    browse: vi.fn(async (filters) => ({ items: [service], page: filters.page, limit: filters.limit, total: 1, totalPages: 1 })),
    findByCreator: vi.fn(async (_id, page, limit) => ({ items: [service], page, limit, total: 1, totalPages: 1 })),
    updateOwned: vi.fn(async (_id, _creator, updates, slug) => ({ ...service, ...updates, slug: slug ?? service.slug })),
    deleteOwned: vi.fn(async () => true),
  };
  return { repo, service: new ServiceService(repo) };
}

describe('ServiceService', () => {
  it('creates services with normalized slugs and creator id', async () => {
    const { repo, service: subject } = setup();
    await subject.create({ title: '  Élan Garden Hall! ', category: 'MARRIAGE_VENUE', description: 'A venue', pricePerDay: 0, location: 'Pune', address: 'Road', images: [], contactDetails: { name: 'Host', phone: '123456789' }, unavailableDates: [] }, 'admin-7');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 'admin-7' }), 'elan-garden-hall');
  });
  it('preserves the slug when the title is not updated', async () => {
    const { repo, service: subject } = setup();
    await subject.update(service.id, 'admin-1', { description: 'Updated' });
    expect(repo.updateOwned).toHaveBeenCalledWith(service.id, 'admin-1', { description: 'Updated' }, undefined);
  });
  it('returns not found for missing or non-owned services', async () => {
    const { repo, service: subject } = setup();
    vi.mocked(repo.updateOwned).mockResolvedValue(null);
    await expect(subject.update(service.id, 'admin-2', { description: 'No access' })).rejects.toMatchObject({ statusCode: 404, code: 'SERVICE_NOT_FOUND' });
    vi.mocked(repo.deleteOwned).mockResolvedValue(false);
    await expect(subject.delete(service.id, 'admin-2')).rejects.toBeInstanceOf(AppError);
  });
});

describe('service request validation', () => {
  const valid = { title: 'Hall', category: 'MARRIAGE_VENUE', description: 'Nice', pricePerDay: 100, location: 'Pune', address: 'Road', images: [], contactDetails: { name: 'Owner', phone: '12345678' }, unavailableDates: [] };
  it('rejects negative prices, invalid image URLs, and overlapping unavailable windows', () => {
    expect(() => createServiceSchema.parse({ ...valid, pricePerDay: -1 })).toThrow();
    expect(() => createServiceSchema.parse({ ...valid, images: ['not-a-url'] })).toThrow();
    expect(() => createServiceSchema.parse({ ...valid, unavailableDates: [{ startDate: '2026-02-01', endDate: '2026-02-03' }, { startDate: '2026-02-03', endDate: '2026-02-04' }] })).toThrow();
  });
  it('rejects empty updates and supports valid partial updates', () => {
    expect(() => updateServiceSchema.parse({})).toThrow();
    expect(updateServiceSchema.parse({ pricePerDay: 50 })).toEqual({ pricePerDay: 50 });
  });
  it('normalizes unicode and punctuation in slugs', () => expect(slugify('Élan / Garden')).toBe('elan-garden'));
});
