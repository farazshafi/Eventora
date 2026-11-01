import express from 'express';
import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { BookingController } from '../src/controllers/booking.controller.js';
import { AppError } from '../src/errors/app-error.js';
import { createBookingRouter } from '../src/routes/booking.routes.js';
import type { BookingRepository } from '../src/repositories/interfaces/booking.repository.interface.js';
import { BookingService } from '../src/services/booking.service.js';
import type { TokenRepository } from '../src/repositories/interfaces/token.repository.interface.js';
import type { TokenService } from '../src/services/interfaces/auth-services.interface.js';

let server: Server | undefined;
let baseUrl = '';
async function start() {
  const row = {
    id: '507f1f77bcf86cd799439012',
    userId: 'user-1',
    serviceId: '507f1f77bcf86cd799439011',
    startDate: new Date('2026-12-01'),
    endDate: new Date('2026-12-01'),
    numberOfDays: 1,
    pricePerDay: 100,
    totalPrice: 100,
    status: 'PENDING' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const repo: BookingRepository = {
    create: vi.fn(async (input) => ({ ...row, userId: input.userId })),
    findMine: vi.fn(async () => ({ items: [row], page: 1, limit: 20, total: 1, totalPages: 1 })),
    findForAdmin: vi.fn(async () => ({
      items: [row],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })),
    cancelOwned: vi.fn(async (id, userId) =>
      id === row.id && userId === row.userId ? { ...row, status: 'CANCELLED' } : null,
    ),
    setAdminStatus: vi.fn(async (id, adminId, status) =>
      id === row.id && adminId === 'admin-1' ? { ...row, status } : null,
    ),
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
    '/api/bookings',
    createBookingRouter(new BookingController(new BookingService(repo)), tokens, jwt),
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
  baseUrl = `http://127.0.0.1:${address.port}/api/bookings`;
  return repo;
}
afterEach(async () => {
  if (server)
    await new Promise<void>((resolve, reject) =>
      server!.close((error) => (error ? reject(error) : resolve())),
    );
  server = undefined;
});

describe('booking API authorization', () => {
  it('requires a user to be authenticated to create and list bookings', async () => {
    await start();
    expect((await fetch(`${baseUrl}/my`)).status).toBe(401);
    expect(
      (
        await fetch(baseUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{}',
        })
      ).status,
    ).toBe(401);
  });
  it('limits admin views and status updates to admins and derives user identity', async () => {
    const repo = await start();
    const headers = { authorization: 'Bearer user', 'content-type': 'application/json' };
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        serviceId: '507f1f77bcf86cd799439011',
        startDate: '2026-12-01',
        endDate: '2026-12-01',
      }),
    });
    expect(response.status).toBe(201);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
    expect((await fetch(`${baseUrl}/admin`, { headers })).status).toBe(403);
    expect(
      (
        await fetch(`${baseUrl}/507f1f77bcf86cd799439012/status`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: 'CONFIRMED' }),
        })
      ).status,
    ).toBe(403);
    expect((await fetch(`${baseUrl}/my?period=invalid`, { headers })).status).toBe(400);
  });
});
