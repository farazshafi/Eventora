import { axiosInstance, getData } from './axios';
import type { ApiSuccess } from '../types/api.types';
import type { User } from '../types/user.types';

export const getCurrentUser = () =>
  getData(axiosInstance.get<ApiSuccess<User>>('/users/me', { requiresAuth: true }));
