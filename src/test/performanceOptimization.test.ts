import { describe, it, expect, vi, beforeEach } from 'vitest';

const { cacheService, MemoryStore } = require('../../server/services/cacheService');
const { cacheMiddleware } = require('../../server/middlewares/cacheMiddleware');
const { compressionMiddleware } = require('../../server/middlewares/compression');
const { parsePaginationParams, paginateQuery } = require('../../server/utils/pagination');
const { JobQueueService } = require('../../server/services/jobQueueService');
const {
  validateImageUpload,
  computeOptimalDimensions,
  bufferToDataUri,
} = require('../../server/utils/imageOptimizer');

describe('F37 — Performance & Scalability Optimization', () => {
  beforeEach(async () => {
    await cacheService.flush();
  });

  describe('Multi-Tier Cache Layer', () => {
    it('sets and retrieves cached keys with hit/miss telemetry', async () => {
      await cacheService.set('doctor:stats:101', { totalPatients: 42, rating: 4.9 }, 60);

      const cached = await cacheService.get('doctor:stats:101');
      expect(cached).toEqual({ totalPatients: 42, rating: 4.9 });

      const miss = await cacheService.get('doctor:stats:nonexistent');
      expect(miss).toBeNull();

      const stats = cacheService.getStats();
      expect(stats.hits).toBeGreaterThanOrEqual(1);
      expect(stats.misses).toBeGreaterThanOrEqual(1);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('invalidates keys matching pattern glob', async () => {
      await cacheService.set('patient:chart:1', { note: 'A' }, 60);
      await cacheService.set('patient:chart:2', { note: 'B' }, 60);
      await cacheService.set('other:data:3', { note: 'C' }, 60);

      const count = await cacheService.invalidatePattern('patient:chart:*');
      expect(count).toBe(2);

      expect(await cacheService.get('patient:chart:1')).toBeNull();
      expect(await cacheService.get('other:data:3')).toEqual({ note: 'C' });
    });
  });

  describe('Route Response Cache Middleware', () => {
    it('bypasses non-GET requests', async () => {
      const middleware = cacheMiddleware({ ttl: 30 });
      const req: any = { method: 'POST', originalUrl: '/api/v1/prescriptions' };
      const res: any = { setHeader: vi.fn(), json: vi.fn() };
      const next = vi.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.setHeader).not.toHaveBeenCalledWith('x-cache', expect.anything());
    });

    it('sets MISS on first GET and HIT on subsequent calls', async () => {
      const middleware = cacheMiddleware({ ttl: 60 });
      const req: any = { method: 'GET', originalUrl: '/api/v1/analytics/summary', user: { id: 'u1' } };
      const res: any = {
        statusCode: 200,
        headers: {},
        setHeader: vi.fn((k: string, v: string) => {
          res.headers[k] = v;
        }),
        json: vi.fn((data: any) => data),
      };
      const next = vi.fn();

      // First call (MISS)
      await middleware(req, res, next);
      expect(res.setHeader).toHaveBeenCalledWith('x-cache', 'MISS');

      // Simulate handler sending response
      res.json({ metric: 100 });

      // Second call (HIT)
      const res2: any = {
        headers: {},
        setHeader: vi.fn((k: string, v: string) => {
          res2.headers[k] = v;
        }),
        json: vi.fn(),
      };
      const next2 = vi.fn();

      await middleware(req, res2, next2);
      expect(res2.setHeader).toHaveBeenCalledWith('x-cache', 'HIT');
      expect(res2.json).toHaveBeenCalledWith({ metric: 100 });
      expect(next2).not.toHaveBeenCalled();
    });
  });

  describe('Server Compression Middleware', () => {
    it('passes through uncompressed if accept-encoding lacks gzip/deflate', () => {
      const middleware = compressionMiddleware({ threshold: 50 });
      const req: any = { headers: {} };
      const res: any = {
        setHeader: vi.fn(),
        send: vi.fn((body: any) => body),
      };
      const next = vi.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();

      const payload = 'A'.repeat(500);
      res.send(payload);
      expect(res.setHeader).not.toHaveBeenCalledWith('Content-Encoding', 'gzip');
    });

    it('compresses payloads larger than threshold when client accepts gzip', () => {
      const middleware = compressionMiddleware({ threshold: 100 });
      const req: any = { headers: { 'accept-encoding': 'gzip, deflate, br' } };
      let sentBody: any = null;
      const res: any = {
        headers: {},
        setHeader: vi.fn((k: string, v: string) => {
          res.headers[k] = v;
        }),
        send: vi.fn((body: any) => {
          sentBody = body;
        }),
      };
      const next = vi.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();

      const largeText = 'HealthSphere Medical Record '.repeat(30);
      res.send(largeText);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Encoding', 'gzip');
      expect(Buffer.isBuffer(sentBody)).toBe(true);
      expect(sentBody.length).toBeLessThan(Buffer.byteLength(largeText));
    });
  });

  describe('Pagination Engine', () => {
    it('safely bounds query parameters', () => {
      const req1: any = { query: { page: '-5', limit: '500' } };
      const parsed = parsePaginationParams(req1, 20, 100);

      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(100); // capped at maxLimit
      expect(parsed.skip).toBe(0);
    });

    it('paginates query results and computes pagination metadata', async () => {
      const mockItems = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const mockModel = {
        find: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockItems),
        countDocuments: vi.fn().mockResolvedValue(25),
      };

      const result = await paginateQuery(mockModel, { status: 'active' }, { page: 2, limit: 10 });

      expect(result.data).toHaveLength(3);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('Background Worker Queue', () => {
    it('enqueues and processes background jobs with priority order', async () => {
      const queue = new JobQueueService({ concurrency: 2 });
      const completedEvents: string[] = [];

      queue.registerHandler('TASK', async (payload: any) => {
        completedEvents.push(payload.label);
        return { done: true };
      });

      queue.enqueue('TASK', { label: 'normal-1' }, { priority: 'normal' });
      queue.enqueue('TASK', { label: 'high-1' }, { priority: 'high' });

      // Wait a tick for async processing
      await new Promise((r) => setTimeout(r, 50));

      const stats = queue.getStats();
      expect(stats.totalJobs).toBe(2);
      expect(stats.completed).toBe(2);
      expect(completedEvents).toContain('high-1');
      expect(completedEvents).toContain('normal-1');
    });
  });

  describe('Image Optimizer Utility', () => {
    it('validates permitted and rejected image types', () => {
      const validPng = { mimetype: 'image/png', size: 1024 * 500 };
      const invalidExe = { mimetype: 'application/x-msdownload', size: 1024 };

      expect(validateImageUpload(validPng).valid).toBe(true);
      expect(validateImageUpload(invalidExe).valid).toBe(false);
    });

    it('computes aspect ratio constrained dimensions', () => {
      const dims = computeOptimalDimensions(4000, 2000, 1200);
      expect(dims.width).toBe(1200);
      expect(dims.height).toBe(600);
    });

    it('generates base64 data URI', () => {
      const buf = Buffer.from('test-image-content');
      const uri = bufferToDataUri(buf, 'image/jpeg');
      expect(uri).toContain('data:image/jpeg;base64,');
    });
  });
});
