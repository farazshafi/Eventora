import { Router } from 'express';
import type { BookingController } from '../controllers/booking.controller.js';
import { createAuthenticate } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate-request.js';
import type { TokenRepository } from '../repositories/interfaces/token.repository.interface.js';
import type { TokenService } from '../services/interfaces/auth-services.interface.js';
import {
  bookingAdminQuerySchema,
  bookingIdParamsSchema,
  bookingListQuerySchema,
  bookingStatusSchema,
  createBookingSchema,
} from '../validators/booking.validator.js';

export function createBookingRouter(
  controller: BookingController,
  tokens: TokenRepository,
  jwt: TokenService,
): Router {
  const router = Router();
  const authenticate = createAuthenticate(jwt, tokens);
  const admin = [authenticate, authorizeRole('ADMIN')];
  router.post('/', authenticate, validateRequest({ body: createBookingSchema }), controller.create);
  router.get(
    '/my',
    authenticate,
    validateRequest({ query: bookingListQuerySchema }),
    controller.mine,
  );
  router.get(
    '/admin',
    ...admin,
    validateRequest({ query: bookingAdminQuerySchema }),
    controller.admin,
  );
  router.get('/', ...admin, validateRequest({ query: bookingAdminQuerySchema }), controller.admin);
  router.patch(
    '/:id/cancel',
    authenticate,
    validateRequest({ params: bookingIdParamsSchema }),
    controller.cancel,
  );
  router.patch(
    '/:id/status',
    ...admin,
    validateRequest({ params: bookingIdParamsSchema, body: bookingStatusSchema }),
    controller.setStatus,
  );
  return router;
}
