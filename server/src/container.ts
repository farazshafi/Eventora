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

const users = new MongoUserRepository();
const tokens = new MongoTokenRepository();
const passwords = new BcryptPasswordService();
const jwt = new JwtTokenService();
const userService = new UserService(users, tokens, passwords, jwt);
const userController = new UserController(userService);

export const userRouter = createUserRouter(userController, tokens, jwt);
const serviceRepository = new MongoServiceRepository();
const serviceService = new ServiceService(serviceRepository);
const serviceController = new ServiceController(serviceService);
export const serviceRouter = createServiceRouter(serviceController, tokens, jwt);
export const healthRouter = createHealthRouter();
