import { MongoUserRepository } from './repositories/user.repository.js';
import { MongoTokenRepository } from './repositories/token.repository.js';
import { BcryptPasswordService } from './services/password.service.js';
import { JwtTokenService } from './services/jwt.service.js';
import { UserService } from './services/user.service.js';
import { UserController } from './controllers/user.controller.js';
import { createUserRouter } from './routes/user.routes.js';
import { createHealthRouter } from './routes/health.routes.js';
import { MongoServiceRepository } from './repositories/service.repository.js';
import { ServiceService } from './services/service.service.js';
import { ServiceController } from './controllers/service.controller.js';
import { createServiceRouter } from './routes/service.routes.js';
import { MongoBookingRepository } from './repositories/booking.repository.js';
import { BookingService } from './services/booking.service.js';
import { BookingController } from './controllers/booking.controller.js';
import { createBookingRouter } from './routes/booking.routes.js';
import { SmtpEmailService2 } from './services/email.service.js';
import { BookingNotificationService } from './services/booking-notification.service.js';

const users = new MongoUserRepository();
const tokens = new MongoTokenRepository();
const passwords = new BcryptPasswordService();
const jwt = new JwtTokenService();
const email = new SmtpEmailService2();
const userService = new UserService(users, tokens, passwords, jwt, email);
const userController = new UserController(userService);

export const userRouter = createUserRouter(userController, tokens, jwt);
const serviceRepository = new MongoServiceRepository();
const serviceService = new ServiceService(serviceRepository);
const serviceController = new ServiceController(serviceService);
export const serviceRouter = createServiceRouter(serviceController, tokens, jwt);
const bookingRepository = new MongoBookingRepository();
const bookingService = new BookingService(
  bookingRepository,
  new BookingNotificationService(users, serviceRepository, email),
);
const bookingController = new BookingController(bookingService);
export const bookingRouter = createBookingRouter(bookingController, tokens, jwt);
export const healthRouter = createHealthRouter();
