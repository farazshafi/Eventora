import type { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';
import type { UserService } from '../services/user.service.js';

export class UserController {
  constructor(private readonly users: UserService) {}
  register = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.users.register(request.body), 201);
  verifyEmail = async (request: Request, response: Response): Promise<void> =>
    this.sendAuth(response, await this.users.verifyEmail(request.body.email, request.body.code));
  resendVerification = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.users.resendVerification(request.body.email));
  login = async (request: Request, response: Response): Promise<void> =>
    this.sendAuth(response, await this.users.login(request.body));
  adminLogin = async (request: Request, response: Response): Promise<void> =>
    this.sendAuth(response, await this.users.login(request.body, 'ADMIN'));
  refresh = async (request: Request, response: Response): Promise<void> => {
    const token = readRefreshCookie(request);
    if (!token) {
      response.clearCookie('eventoraRefresh', cookieOptions());
      response
        .status(401)
        .json({
          success: false,
          error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired' },
        });
      return;
    }
    try {
      this.sendAuth(response, await this.users.refresh(token));
    } catch (error) {
      response.clearCookie('eventoraRefresh', cookieOptions());
      throw error;
    }
  };
  me = async (request: Request, response: Response): Promise<void> =>
    sendSuccess(response, await this.users.getCurrentUser(request.auth!));
  logout = async (request: Request, response: Response): Promise<void> => {
    await this.users.logout(request.auth!);
    await this.users.logoutRefresh(readRefreshCookie(request));
    response.clearCookie('eventoraRefresh', cookieOptions());
    sendSuccess(response, { message: 'Logged out successfully' });
  };
  private sendAuth(response: Response, result: Awaited<ReturnType<UserService['login']>>): void {
    const { refreshToken, refreshExpiresAt, ...body } = result;
    response.cookie('eventoraRefresh', refreshToken, {
      ...cookieOptions(),
      expires: refreshExpiresAt,
    });
    sendSuccess(response, body);
  }
}
function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/api/users',
  };
}
function readRefreshCookie(request: Request): string | undefined {
  const header = request.header('cookie');
  const item = header
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('eventoraRefresh='));
  return item ? decodeURIComponent(item.slice('eventoraRefresh='.length)) : undefined;
}
