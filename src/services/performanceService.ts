import { api } from './api';

export interface PerformanceMetrics {
  cache: {
    type: string;
    cachedKeys: number;
    hits: number;
    misses: number;
    hitRatio: string;
    sets: number;
    deletes: number;
  };
  queue: {
    activeWorkers: number;
    maxConcurrent: number;
    pendingJobs: number;
    totalCompleted: number;
    totalFailed: number;
    recentJobs: Array<{
      id: string;
      type: string;
      priority: string;
      status: string;
      progress: number;
      createdAt: string;
      completedAt: string | null;
    }>;
  };
  system: {
    heapUsedMb: string;
    heapTotalMb: string;
    rssMb: string;
    totalSystemMemMb: string;
    freeSystemMemMb: string;
    cpuCores: number;
    uptimeSeconds: string;
  };
}

export const performanceService = {
  async getMetrics(): Promise<{ success: boolean; timestamp: string } & PerformanceMetrics> {
    const res = await api.get('/performance/metrics');
    return res.data;
  },

  async purgeCache(): Promise<{ success: boolean; clearedKeys: number; message: string }> {
    const res = await api.post('/performance/cache/purge');
    return res.data;
  },

  async triggerJob(type: string, priority = 'normal', payload = {}): Promise<{ success: boolean; job: any; message: string }> {
    const res = await api.post('/performance/jobs/trigger', { type, priority, payload });
    return res.data;
  },
};
