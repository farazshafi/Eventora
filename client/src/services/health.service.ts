const apiBasePath = import.meta.env.VITE_API_BASE_PATH ?? '/api';

export interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptime: number;
}
interface SuccessResponse<T> {
  success: true;
  data: T;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const response = await fetch(`${apiBasePath}/health`);
  if (!response.ok) throw new Error(`Health check failed with status ${response.status}`);
  const result: SuccessResponse<HealthStatus> = await response.json();
  return result.data;
}
