import type { Request, Response } from 'express';
import { sendSuccess } from '../../../core/utils/response.js';
import type { AuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(private readonly auth: AuthService) {}
  register = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.auth.register(request.body), 201);
  login = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.auth.login(request.body));
  adminLogin = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.auth.login(request.body, 'ADMIN'));
  me = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.auth.getCurrentUser(request.auth!));
  logout = async (request: Request, response: Response): Promise<void> => {
    await this.auth.logout(request.auth!);
    sendSuccess(response, { message: 'Logged out successfully' });
  };
}
