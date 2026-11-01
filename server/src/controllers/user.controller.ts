import type { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';
import type { UserService } from '../services/user.service.js';

export class UserController {
  constructor(private readonly users: UserService) {}
  register = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.users.register(request.body), 201);
  login = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.users.login(request.body));
  adminLogin = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.users.login(request.body, 'ADMIN'));
  me = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.users.getCurrentUser(request.auth!));
  logout = async (request: Request, response: Response): Promise<void> => {
    await this.users.logout(request.auth!);
    sendSuccess(response, { message: 'Logged out successfully' });
  };
}
