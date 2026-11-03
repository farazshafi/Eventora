import express from 'express';
import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { AppError } from '../src/errors/app-error.js';
import { ServiceController } from '../src/controllers/service.controller.js';
import { createServiceRouter } from '../src/routes/service.routes.js';
import type { ServiceRecord } from '../src/types/service.types.js';
import type { ServiceRepository } from '../src/repositories/interfaces/service.repository.interface.js';
import { ServiceService } from '../src/services/service.service.js';
import type { TokenRepository } from '../src/repositories/interfaces/token.repository.interface.js';
import type { TokenService } from '../src/services/interfaces/auth-services.interface.js';

const row: ServiceRecord = {
  id: '507f1f77bcf86cd799439011',
  title: 'Garden Hall',
  slug: 'garden-hall',
  category: 'MARRIAGE_VENUE',
  description: 'Venue',
  pricePerDay: 1200,
  location: 'Pune',
  address: 'Main Road',
  images: [],
  contactDetails: { name: 'Host', phone: '123456789' },
  unavailableDates: [],
  createdBy: 'admin-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};
let server: Server | undefined;
let baseUrl: string;

async function start() {
  const repository: ServiceRepository = {
    create: vi.fn(async (input, slug) => ({ ...row, ...input, slug })),
    findById: vi.fn(async (id) => (id === row.id ? row : null)),
    browse: vi.fn(async (filters) => ({
      services: [row],
      currentPage: filters.page,
      limit: filters.limit,
      totalItems: 1,
      totalPages: 1,
    })),
    findByCreator: vi.fn(async (_creator, page, limit) => ({
      items: [row],
      page,
      limit,
      total: 1,
      totalPages: 1,
    })),
    updateOwned: vi.fn(async (id, creator, updates, slug) =>
      id === row.id && creator === row.createdBy
        ? { ...row, ...updates, slug: slug ?? row.slug }
        : null,
    ),
    deleteOwned: vi.fn(async (id, creator) => id === row.id && creator === row.createdBy),
  };
  const tokens: TokenRepository = {
    isRevoked: vi.fn(async () => false),
    revoke: vi.fn(async () => {}),
  };
  const jwt: TokenService = {
    sign: vi.fn(() => 'unused'),
    verify: vi.fn((token) => ({
      sub: token === 'admin' ? 'admin-1' : 'user-1',
      role: token === 'admin' ? 'ADMIN' : 'USER',
      jti: token,
      exp: 2_000_000_000,
    })),
  };
  const app = express();
  app.use(express.json());
  app.use(
    '/api/services',
    createServiceRouter(new ServiceController(new ServiceService(repository)), tokens, jwt),
  );
  app.use(
    (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      void _next;
      const status =
        error instanceof AppError ? error.statusCode : error instanceof ZodError ? 400 : 500;
      res
        .status(status)
        .json({ error: error instanceof AppError ? error.code : 'VALIDATION_ERROR' });
    },
  );
  server = createServer(app);
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind');
  baseUrl = `http://127.0.0.1:${address.port}/api/services`;
  return repository;
}

afterEach(async () => {
  if (server)
    await new Promise<void>((resolve, reject) =>
      server!.close((error) => (error ? reject(error) : resolve())),
    );
  server = undefined;
});

describe('service API integration', () => {
  it('allows public browsing and service details and returns validated pagination', async () => {
    await start();
    const browse = await fetch(`${baseUrl}?category=MARRIAGE_VENUE&location=Pune&page=1&limit=10`);
    expect(browse.status).toBe(200);
    expect(await browse.json()).toMatchObject({
      success: true,
      data: {
        services: [{ slug: 'garden-hall' }],
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        limit: 10,
      },
    });
    expect((await fetch(`${baseUrl}/${row.id}`)).status).toBe(200);
    expect((await fetch(`${baseUrl}?page=0`)).status).toBe(400);
    expect((await fetch(`${baseUrl}?startDate=2026-12-10`)).status).toBe(400);
    expect((await fetch(`${baseUrl}?startDate=2026-12-12&endDate=2026-12-10`)).status).toBe(400);
  });
  it('requires an authenticated admin for writes and creator ownership for updates/deletes', async () => {
    const repo = await start();
    expect(
      (
        await fetch(baseUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{}',
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await fetch(baseUrl, {
          method: 'POST',
          headers: { authorization: 'Bearer user', 'content-type': 'application/json' },
          body: '{}',
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await fetch(`${baseUrl}/${row.id}`, {
          method: 'PATCH',
          headers: { authorization: 'Bearer admin', 'content-type': 'application/json' },
          body: JSON.stringify({ description: 'Edited' }),
        })
      ).status,
    ).toBe(200);
    expect(repo.updateOwned).toHaveBeenCalledWith(
      row.id,
      'admin-1',
      { description: 'Edited' },
      undefined,
    );
    expect(
      (
        await fetch(`${baseUrl}/${row.id}`, {
          method: 'DELETE',
          headers: { authorization: 'Bearer user', 'content-type': 'application/json' },
        })
      ).status,
    ).toBe(403);
  });
  it('creates and lists admin-managed services', async () => {
    const repo = await start();
    const body = {
      title: 'Garden Hall',
      category: 'MARRIAGE_VENUE',
      description: 'Venue',
      pricePerDay: 500,
      location: 'Pune',
      address: 'Road',
      images: [],
      contactDetails: { name: 'Host', phone: '123456789' },
      unavailableDates: [],
    };
    const created = await fetch(baseUrl, {
      method: 'POST',
      headers: { authorization: 'Bearer admin', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(created.status).toBe(201);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'admin-1' }),
      'garden-hall',
    );
    expect(
      (await fetch(`${baseUrl}/admin/mine`, { headers: { authorization: 'Bearer admin' } })).status,
    ).toBe(200);
  });

  it('accepts validated admin service filters and passes them to the repository', async () => {
    const repo = await start();
    const response = await fetch(
      `${baseUrl}/admin/mine?page=2&limit=10&search=garden&category=MARRIAGE_VENUE`,
      { headers: { authorization: 'Bearer admin' } },
    );
    expect(response.status).toBe(200);
    expect(repo.findByCreator).toHaveBeenCalledWith('admin-1', 2, 10, {
      search: 'garden',
      category: 'MARRIAGE_VENUE',
    });
    expect(
      (
        await fetch(`${baseUrl}/admin/mine?category=INVALID`, {
          headers: { authorization: 'Bearer admin' },
        })
      ).status,
    ).toBe(400);
  });
});
