import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { authToken, unauthorizedEvent } from '../utils/auth-token';
import type { ApiFailure, ApiSuccess } from '../types/api.types';

declare module 'axios' {
  // Axios requires matching generic declarations; these method-level generics are defined upstream.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  export interface AxiosRequestConfig<D = any> {
    requiresAuth?: boolean;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  export interface InternalAxiosRequestConfig<D = any> {
    requiresAuth?: boolean;
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_PATH ?? '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const axiosInstance = axios.create({ baseURL: apiBaseUrl, withCredentials: true });

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.requiresAuth) {
    const token = authToken.get();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiFailure>) => {
    const requestConfig = error.config as AxiosRequestConfig | undefined;
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    if (
      status === 401 &&
      requestConfig?.requiresAuth &&
      requestConfig &&
      !(requestConfig as AxiosRequestConfig & { _retried?: boolean })._retried
    ) {
      const retryConfig = requestConfig as AxiosRequestConfig & { _retried?: boolean };
      retryConfig._retried = true;
      try {
        refreshPromise ??= axios
          .post<ApiSuccess<{ accessToken: string }>>(`${apiBaseUrl}/users/refresh`, undefined, {
            withCredentials: true,
          })
          .then((response) => response.data.data.accessToken)
          .finally(() => {
            refreshPromise = null;
          });
        const newToken = await refreshPromise;
        authToken.set(newToken);
        retryConfig.headers = { ...retryConfig.headers, Authorization: `Bearer ${newToken}` };
        return axiosInstance(retryConfig);
      } catch {
        authToken.clear();
        if (typeof window !== 'undefined') window.dispatchEvent(new Event(unauthorizedEvent));
      }
    }
    return Promise.reject(
      new ApiError(
        payload && !payload.success
          ? payload.error.message
          : status === 0
            ? 'Could not reach the server. Check your connection and try again.'
            : 'Something went wrong. Please try again.',
        status,
        payload && !payload.success ? payload.error.code : undefined,
      ),
    );
  },
);

export async function getData<T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}
