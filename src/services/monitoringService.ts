import { api } from './api';

export interface DiagnosticsData {
  environment: {
    nodeEnv: string;
    hasJwtSecret: boolean;
    hasMongoUri: boolean;
    port: number | string;
    corsConfigured: boolean;
    encryptionSecretConfigured: boolean;
  };
  backup: {
    status: string;
    lastBackupAt: string;
    backupFrequency: string;
    rpoHours: number;
    rtoMinutes: number;
    backupStorage: string;
  };
  system: {
    totalRequests: number;
    statusCodes: {
      '2xx': number;
      '3xx': number;
      '4xx': number;
      '5xx': number;
    };
    endpoints: Array<{
      route: string;
      requests: number;
      avgDurationMs: string;
      minMs: string;
      maxMs: string;
      errorRate: string;
    }>;
    crashes: Array<{
      id: string;
      timestamp: string;
      name: string;
      message: string;
      stack: string;
      context: any;
    }>;
  };
}

export const monitoringService = {
  async getDiagnostics(): Promise<{ success: boolean } & DiagnosticsData> {
    const res = await api.get('/monitoring/diagnostics');
    return res.data;
  },

  async getCrashLogs(): Promise<{ success: boolean; crashes: DiagnosticsData['system']['crashes'] }> {
    const res = await api.get('/monitoring/crashes');
    return res.data;
  },
};
