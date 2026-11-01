import { HealthController } from './modules/health/controllers/health.controller.js';
import { MongoHealthRepository } from './modules/health/repositories/health.repository.js';
import { GetHealthStatusService } from './modules/health/services/get-health-status.service.js';
import { createHealthRouter } from './modules/health/routes/health.routes.js';
import { createApiRouter } from './routes/index.js';
import { MongoUserRepository } from './modules/users/repositories/mongo-user.repository.js';
import { MongoTokenRepository } from './modules/auth/repositories/mongo-token.repository.js';
import { BcryptPasswordService } from './modules/auth/services/bcrypt-password.service.js';
import { JwtTokenService } from './modules/auth/services/jwt-token.service.js';
import { AuthService } from './modules/auth/services/auth.service.js';
import { AuthController } from './modules/auth/controllers/auth.controller.js';
import { createAuthRouter } from './modules/auth/routes/auth.routes.js';

const healthRepository = new MongoHealthRepository();
const getHealthStatus = new GetHealthStatusService(healthRepository);
const healthController = new HealthController(getHealthStatus);

export const healthRouter = createHealthRouter(healthController);
const userRepository = new MongoUserRepository();
const tokenRepository = new MongoTokenRepository();
const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();
const authService = new AuthService(userRepository, tokenRepository, passwordService, tokenService);
const authController = new AuthController(authService);
const authRouter = createAuthRouter(authController, tokenRepository, tokenService);

export const apiRouter = createApiRouter(healthRouter, authRouter);
