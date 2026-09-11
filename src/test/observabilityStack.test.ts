import { describe, it, expect, beforeEach } from 'vitest';

describe('F38 — Monitoring & Observability Stack Suite', () => {
  // ----------------------------------------------------
  // 1. Structured Logging
  // ----------------------------------------------------
  it('1. Structured Logger: exports configured winston instance with service metadata', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const logger = require('../../server/utils/logger');

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(logger.defaultMeta?.service).toBe('healthsphere-ai-backend');
  });

  // ----------------------------------------------------
  // 2. Request Tracing & Correlation Middleware
  // ----------------------------------------------------
  it('2. Request Logger Middleware: injects X-Request-Id and registers finish listener', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { requestLogger } = require('../../server/middlewares/requestLogger');

    const headersSent: Record<string, string> = {};
    const listeners: Record<string, () => void> = {};

    const mockReq = {
      headers: {},
      method: 'GET',
      path: '/api/records',
      originalUrl: '/api/records',
      ip: '127.0.0.1',
    };

    const mockRes = {
      setHeader: (name: string, val: string) => {
        headersSent[name] = val;
      },
      on: (event: string, cb: () => void) => {
        listeners[event] = cb;
      },
      statusCode: 200,
      headersSent: false,
    };

    let nextCalled = false;
    // @ts-expect-error mock request
    requestLogger(mockReq, mockRes, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(mockReq.requestId).toBeDefined();
    expect(headersSent['X-Request-Id']).toBe(mockReq.requestId);
    expect(typeof listeners['finish']).toBe('function');
  });

  // ----------------------------------------------------
  // 3. Metrics Aggregator Service
  // ----------------------------------------------------
  describe('3. Metrics Service Aggregations', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const metricsService = require('../../server/services/metricsService');

    beforeEach(() => {
      metricsService.reset();
    });

    it('records response times and calculates percentile distributions', () => {
      // Record sample latencies: 10ms to 100ms
      for (let i = 1; i <= 100; i++) {
        metricsService.recordRequest(200, i);
      }

      const metrics = metricsService.getMetrics();
      expect(metrics.requests.total).toBe(100);
      expect(metrics.requests.success).toBe(100);
      expect(metrics.requests.serverErrors).toBe(0);
      expect(metrics.latencyMs.p50).toBeCloseTo(50, 1);
      expect(metrics.latencyMs.p95).toBeCloseTo(95, 1);
      expect(metrics.latencyMs.p99).toBeCloseTo(99, 1);
      expect(metrics.latencyMs.avg).toBeCloseTo(50.5, 1);
    });

    it('correctly categorizes 4xx and 5xx errors and computes error rate', () => {
      metricsService.recordRequest(200, 25);
      metricsService.recordRequest(404, 10);
      metricsService.recordRequest(500, 45);
      metricsService.recordRequest(503, 50);

      const metrics = metricsService.getMetrics();
      expect(metrics.requests.total).toBe(4);
      expect(metrics.requests.success).toBe(1);
      expect(metrics.requests.clientErrors).toBe(1);
      expect(metrics.requests.serverErrors).toBe(2);
      expect(metrics.requests.errorRatePct).toBe(50);
      expect(metrics.memory.heapUsedMB).toBeGreaterThan(0);
    });
  });

  // ----------------------------------------------------
  // 4. System Observability Controllers
  // ----------------------------------------------------
  describe('4. Observability Endpoint Controllers', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getLiveness, getReadiness, getMetrics, getHealth } = require('../../server/controllers/systemController');

    it('getLiveness returns 200 alive state', () => {
      let statusCode = 0;
      let body: unknown = null;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (data: unknown) => {
              body = data;
            },
          };
        },
      };

      // @ts-expect-error mock request
      getLiveness({}, mockRes);

      expect(statusCode).toBe(200);
      expect(body).toEqual(expect.objectContaining({ status: 'alive' }));
    });

    it('getReadiness checks database state cleanly', async () => {
      let statusCode = 0;
      let body: unknown = null;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (data: unknown) => {
              body = data;
            },
          };
        },
      };

      // @ts-expect-error mock request
      await getReadiness({}, mockRes);

      // In unit test without running mongo daemon, readiness reports 503 not_ready or 200 ready
      expect([200, 503]).toContain(statusCode);
      expect(body).toBeDefined();
    });

    it('getHealth returns complete subsystem diagnostic metadata', async () => {
      let statusCode = 0;
      let body: { status?: string; service?: string; memory?: { heapUsedMB: number }; uptimeSeconds?: number } | null = null;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (data: typeof body) => {
              body = data;
            },
          };
        },
      };

      // @ts-expect-error mock request
      await getHealth({}, mockRes);

      expect([200, 503]).toContain(statusCode);
      expect(body?.service).toBe('healthsphere-healthcare-os');
      expect(body?.memory?.heapUsedMB).toBeGreaterThan(0);
      expect(typeof body?.uptimeSeconds).toBe('number');
    });

    it('getMetrics outputs real-time latency and request distributions', () => {
      let statusCode = 0;
      let body: { success?: boolean; data?: { uptimeSeconds: number } } | null = null;

      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (data: typeof body) => {
              body = data;
            },
          };
        },
      };

      // @ts-expect-error mock request
      getMetrics({}, mockRes);

      expect(statusCode).toBe(200);
      expect(body?.success).toBe(true);
      expect(body?.data?.uptimeSeconds).toBeDefined();
    });
  });
});
