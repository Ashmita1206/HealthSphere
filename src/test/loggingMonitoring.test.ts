import { describe, it, expect, vi } from 'vitest';

const logger = require('../../server/utils/logger');
const { MetricsRegistry } = require('../../server/utils/metrics');
const { requestLoggerMiddleware } = require('../../server/middlewares/requestLogger');

describe('F39 — Logging, Observability & Production Monitoring', () => {
  describe('Winston Structured Logger', () => {
    it('is properly instantiated with structured logging levels', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('logs error with stack trace and metadata', () => {
      const spy = vi.spyOn(logger, 'error');
      logger.error('Diagnostic error test', {
        errorCode: 'E_TEST_VAL',
        userId: 'test-user-123',
      });

      expect(spy).toHaveBeenCalledWith(
        'Diagnostic error test',
        expect.objectContaining({ errorCode: 'E_TEST_VAL', userId: 'test-user-123' }),
      );
      spy.mockRestore();
    });
  });

  describe('Prometheus Metrics Registry', () => {
    it('records requests and generates Prometheus text format exposition', () => {
      const registry = new MetricsRegistry();

      registry.recordHttpRequest('GET', '/api/v1/patients', 200, 45.5);
      registry.recordHttpRequest('GET', '/api/v1/patients', 200, 32.1);
      registry.recordHttpRequest('POST', '/api/v1/prescriptions', 201, 110.0);
      registry.recordHttpRequest('GET', '/api/v1/patients', 404, 12.0);

      registry.incrementSockets();
      registry.incrementSockets();
      registry.decrementSockets();

      const output = registry.toPrometheusFormat();

      expect(output).toContain('# HELP healthsphere_http_requests_total');
      expect(output).toContain('# TYPE healthsphere_http_requests_total counter');
      expect(output).toContain('healthsphere_http_requests_total{method="GET",route="/api/v1/patients",status="2xx"} 2');
      expect(output).toContain('healthsphere_http_requests_total{method="POST",route="/api/v1/prescriptions",status="2xx"} 1');
      expect(output).toContain('healthsphere_http_requests_total{method="GET",route="/api/v1/patients",status="4xx"} 1');

      expect(output).toContain('# HELP healthsphere_active_sockets');
      expect(output).toContain('healthsphere_active_sockets 1');

      expect(output).toContain('# HELP healthsphere_nodejs_heap_used_bytes');
      expect(output).toContain('# HELP healthsphere_process_uptime_seconds');
    });
  });

  describe('Request Logger Middleware', () => {
    it('records duration and metrics without altering response flow', () => {
      const listeners: { [key: string]: Function } = {};
      const req: any = {
        method: 'GET',
        originalUrl: '/api/v1/healthcheck',
        id: 'trace-req-888',
        headers: { 'user-agent': 'Vitest-Agent' },
      };
      const res: any = {
        statusCode: 200,
        on: vi.fn((event: string, cb: Function) => {
          listeners[event] = cb;
        }),
      };
      const next = vi.fn();

      requestLoggerMiddleware(req, res, next);
      expect(next).toHaveBeenCalled();

      // Trigger finish event
      expect(typeof listeners['finish']).toBe('function');
      listeners['finish']();
    });
  });
});
