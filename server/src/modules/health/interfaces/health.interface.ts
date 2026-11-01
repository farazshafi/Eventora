export interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptime: number;
  database: 'ready';
}

export interface HealthReadiness {
  status: 'ok' | 'unavailable';
  timestamp: string;
  uptime: number;
  database: 'ready' | 'unavailable';
}
