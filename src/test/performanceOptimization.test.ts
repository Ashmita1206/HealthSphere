import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { getOptimizedImageUrl, generateResponsiveSrcSet } from '../utils/imageOptimizer';

describe('F39 — Production Performance Optimization Suite', () => {
  // ----------------------------------------------------
  // 1. Redis-Ready Cache Abstraction Service
  // ----------------------------------------------------
  describe('1. Cache Service Engine', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cacheService = require('../../server/services/cacheService');

    beforeEach(async () => {
      await cacheService.flush();
    });

    it('stores and retrieves cache entries with accurate hit ratios', async () => {
      await cacheService.set('patient:profile:101', { name: 'Alice', bp: '120/80' }, 60);

      const cached = await cacheService.get('patient:profile:101');
      expect(cached).toEqual({ name: 'Alice', bp: '120/80' });

      // Non-existent key generates miss
      const missing = await cacheService.get('patient:profile:999');
      expect(missing).toBeNull();

      const stats = cacheService.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRatioPct).toBe(50);
    });

    it('evicts expired keys based on TTL', async () => {
      // Set key with negative or 0 TTL (already expired)
      await cacheService.set('short_lived', 'temp_val', -1);

      const result = await cacheService.get('short_lived');
      expect(result).toBeNull();
    });

    it('correctly reports key existence and supports deletion', async () => {
      await cacheService.set('key_to_delete', { data: 'test' }, 60);
      expect(await cacheService.has('key_to_delete')).toBe(true);

      await cacheService.del('key_to_delete');
      expect(await cacheService.has('key_to_delete')).toBe(false);
    });
  });

  // ----------------------------------------------------
  // 2. API Response Caching Middleware
  // ----------------------------------------------------
  describe('2. API Response Caching Middleware', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cacheResponse } = require('../../server/middlewares/cacheMiddleware');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cacheService = require('../../server/services/cacheService');

    beforeEach(async () => {
      await cacheService.flush();
    });

    it('bypasses caching on non-GET methods', async () => {
      const middleware = cacheResponse(60);
      const req = { method: 'POST', path: '/api/records' };
      let nextCalled = false;

      // @ts-expect-error mock request
      await middleware(req, {}, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it('attaches X-Cache: MISS on initial request and HIT on subsequent request', async () => {
      const middleware = cacheResponse(60);
      const headers: Record<string, string> = {};

      const req = {
        method: 'GET',
        path: '/api/doctors/directory',
        headers: {},
        query: { specialty: 'Cardiology' },
      };

      const res = {
        setHeader: (k: string, v: string) => {
          headers[k] = v;
        },
        statusCode: 200,
        json: (data: unknown) => data,
      };

      // 1st request -> MISS
      // @ts-expect-error mock request
      await middleware(req, res, () => {
        res.json({ doctors: [{ name: 'Dr. Evans' }] });
      });
      expect(headers['X-Cache']).toBe('MISS');

      // 2nd request -> HIT
      let hitReturned = false;
      const resHit = {
        setHeader: (k: string, v: string) => {
          headers[k] = v;
        },
        status: (code: number) => ({
          json: (data: unknown) => {
            hitReturned = true;
            return { code, data };
          },
        }),
      };

      // @ts-expect-error mock request
      await middleware(req, resHit, () => {});
      expect(headers['X-Cache']).toBe('HIT');
      expect(hitReturned).toBe(true);
    });

    it('bypasses cache when client provides Cache-Control: no-cache', async () => {
      const middleware = cacheResponse(60);
      const headers: Record<string, string> = {};
      const req = {
        method: 'GET',
        path: '/api/records',
        headers: { 'cache-control': 'no-cache' },
      };
      const res = {
        setHeader: (k: string, v: string) => {
          headers[k] = v;
        },
      };

      let nextCalled = false;
      // @ts-expect-error mock request
      await middleware(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(headers['X-Cache']).toBe('BYPASS');
    });
  });

  // ----------------------------------------------------
  // 3. Compression Middleware
  // ----------------------------------------------------
  describe('3. Native Compression Middleware', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { compressionMiddleware, COMPRESSION_THRESHOLD } = require('../../server/middlewares/compression');

    it('passes through small payloads under 1KB without compression', () => {
      const headers: Record<string, string> = {};
      const req = {
        headers: { 'accept-encoding': 'gzip, deflate' },
      };
      let sentBody = '';
      const res = {
        headersSent: false,
        getHeader: () => null,
        setHeader: (k: string, v: string) => {
          headers[k] = v;
        },
        send: (body: unknown) => {
          sentBody = String(body);
        },
      };

      // @ts-expect-error mock request
      compressionMiddleware(req, res, () => {
        res.send('Tiny payload');
      });

      expect(sentBody).toBe('Tiny payload');
      expect(headers['Content-Encoding']).toBeUndefined();
    });

    it('compresses payloads larger than 1KB when gzip is accepted', async () => {
      const headers: Record<string, string> = {};
      const req = {
        headers: { 'accept-encoding': 'gzip' },
      };

      const largePayload = 'A'.repeat(COMPRESSION_THRESHOLD + 500);

      const res = {
        headersSent: false,
        getHeader: () => null,
        setHeader: (k: string, v: string) => {
          headers[k] = v;
        },
        removeHeader: () => {},
        send: () => {},
      };

      let nextCalled = false;
      // @ts-expect-error mock request
      compressionMiddleware(req, res, () => {
        nextCalled = true;
        res.send(largePayload);
      });

      expect(nextCalled).toBe(true);
      expect(headers['Content-Encoding']).toBe('gzip');
    });
  });

  // ----------------------------------------------------
  // 4. Image Optimization Utility
  // ----------------------------------------------------
  describe('4. Image Optimization Utility', () => {
    it('applies Cloudinary transformation parameters (f_auto, q_auto, dimensions)', () => {
      const rawUrl = 'https://res.cloudinary.com/healthsphere/image/upload/v12345/avatar.png';
      const optimized = getOptimizedImageUrl(rawUrl, { width: 400, height: 400, quality: 'auto', format: 'webp' });

      expect(optimized).toContain('f_webp');
      expect(optimized).toContain('q_auto');
      expect(optimized).toContain('w_400');
      expect(optimized).toContain('h_400');
      expect(optimized).toContain('c_fill');
    });

    it('generates responsive srcSet breakpoints', () => {
      const rawUrl = 'https://res.cloudinary.com/healthsphere/image/upload/v12345/chart.png';
      const srcSet = generateResponsiveSrcSet(rawUrl, [320, 640, 1024]);

      expect(srcSet).toContain('320w');
      expect(srcSet).toContain('640w');
      expect(srcSet).toContain('1024w');
    });

    it('returns original URL for non-Cloudinary images safely', () => {
      const localUrl = '/assets/healthsphere-logo.png';
      expect(getOptimizedImageUrl(localUrl, { width: 200 })).toBe(localUrl);
    });
  });

  // ----------------------------------------------------
  // 5. Code Splitting & Bundle Configuration
  // ----------------------------------------------------
  describe('5. Bundle Splitting Architecture', () => {
    it('App.tsx uses React.lazy and Suspense for route level code splitting', () => {
      const appFile = path.resolve(__dirname, '../App.tsx');
      const content = fs.readFileSync(appFile, 'utf-8');

      expect(content).toMatch(/import\s*\{\s*lazy,\s*Suspense\s*\}\s*from\s*['"]react['"]/);
      expect(content).toMatch(/const\s+DoctorPortal\s*=\s*lazy\(/);
      expect(content).toMatch(/const\s+TelemedicineRoom\s*=\s*lazy\(/);
      expect(content).toMatch(/const\s+WearableDashboard\s*=\s*lazy\(/);
      expect(content).toMatch(/<Suspense\s+fallback=/);
      expect(content).toMatch(/AppLoadingFallback/);
    });

    it('vite.config.ts configures vendor chunk splitting', () => {
      const viteFile = path.resolve(__dirname, '../../vite.config.ts');
      const content = fs.readFileSync(viteFile, 'utf-8');

      expect(content).toMatch(/manualChunks/);
      expect(content).toMatch(/vendor-react/);
      expect(content).toMatch(/vendor-ui/);
      expect(content).toMatch(/vendor-charts/);
    });
  });
});
