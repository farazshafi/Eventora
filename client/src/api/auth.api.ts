import { axiosInstance, getData } from './axios';
import type { ApiSuccess } from '../types/api.types';
import type { AuthResult } from '../types/user.types';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';

export const login = (input: LoginInput) =>
  getData(axiosInstance.post<ApiSuccess<AuthResult>>('/users/login', input));

export const adminLogin = (input: LoginInput) =>
  getData(axiosInstance.post<ApiSuccess<AuthResult>>('/users/admin/login', input));

export const register = (input: RegisterInput) =>
  getData(axiosInstance.post<ApiSuccess<{ verificationRequired: true }>>('/users/register', input));

export const verifyEmail = (email: string, code: string) =>
  getData(axiosInstance.post<ApiSuccess<AuthResult>>('/users/verify-email', { email, code }));
export const resendVerification = (email: string) =>
  getData(axiosInstance.post<ApiSuccess<{ sent: true }>>('/users/resend-verification', { email }));
let startupRefresh: Promise<AuthResult> | null = null;
export const refreshSession = () => {
  startupRefresh ??= getData(axiosInstance.post<ApiSuccess<AuthResult>>('/users/refresh')).finally(
    () => {
      startupRefresh = null;
    },
  );
  return startupRefresh;
};

export const logout = () =>
  getData(
    axiosInstance.post<ApiSuccess<{ message: string }>>('/users/logout', undefined, {
      requiresAuth: true,
    }),
  );
