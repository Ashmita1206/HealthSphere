import { describe, it, expect, vi } from 'vitest';

// Dynamic requires of backend CJS modules
const {
  requestIdMiddleware,
  sanitizeMongoPayload,
  sanitizeString,
  sanitizeXssPayload,
  validateRequest,
  configureCors,
  apiErrorFormatter,
} = require('../../server/middlewares/security');

const {
  apiLimiter,
  authLimiter,
  sensitiveLimiter,
  chatLimiter,
} = require('../../server/middlewares/rateLimiters');

describe('F35 — API Security Layer', () => {
  describe('Request ID Middleware', () => {
    it('generates a new UUID if x-request-id is missing', () => {
      const req: any = { headers: {} };
      const res: any = {
        headers: {},
        setHeader: vi.fn((k: string, v: string) => {
          res.headers[k] = v;
        }),
      };
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).toBeDefined();
      expect(typeof req.id).toBe('string');
      expect(req.id.length).toBeGreaterThan(10);
      expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.id);
      expect(next).toHaveBeenCalled();
    });

    it('preserves an existing valid x-request-id', () => {
      const customId = 'req-trace-999-alpha';
      const req: any = { headers: { 'x-request-id': customId } };
      const res: any = {
        headers: {},
        setHeader: vi.fn(),
      };
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.id).toBe(customId);
      expect(res.setHeader).toHaveBeenCalledWith('x-request-id', customId);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('MongoDB Injection Sanitization', () => {
    it('strips $ operators and keys with dot notation', () => {
      const maliciousPayload = {
        username: 'doctor_smith',
        password: { $gt: '' },
        'profile.role': 'superadmin',
        nested: {
          $where: 'sleep(5000)',
          legitKey: 'safe_value',
        },
        items: [{ $ne: null }, { name: 'Blood Test' }],
      };

      const cleaned = sanitizeMongoPayload(maliciousPayload);

      expect(cleaned.username).toBe('doctor_smith');
      expect(cleaned.password).toEqual({});
      expect(cleaned['profile.role']).toBeUndefined();
      expect(cleaned.nested.$where).toBeUndefined();
      expect(cleaned.nested.legitKey).toBe('safe_value');
      expect(cleaned.items[0]).toEqual({});
      expect(cleaned.items[1].name).toBe('Blood Test');
    });
  });

  describe('XSS Payload Sanitization', () => {
    it('strips script tags, javascript: protocols, and inline event handlers', () => {
      const dirty = '<script>alert("hacked")</script>Dr. John Doe <img src=x onerror=alert(1)>';
      const cleaned = sanitizeString(dirty);

      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('onerror=');
      expect(cleaned).toContain('Dr. John Doe');
    });

    it('recursively sanitizes complex objects', () => {
      const dirtyObject = {
        notes: 'Checkup note <script>fetch("evil.com")</script>',
        metadata: {
          callback: 'javascript:steal()',
          valid: 'Cardiology',
        },
      };

      const cleaned = sanitizeXssPayload(dirtyObject);
      expect(cleaned.notes).not.toContain('<script>');
      expect(cleaned.metadata.callback).not.toContain('javascript:');
      expect(cleaned.metadata.valid).toBe('Cardiology');
    });
  });

  describe('Request Validation Middleware', () => {
    it('validates schema and returns 400 with standardized format on error', () => {
      const mockSchema = {
        validate: vi.fn().mockReturnValue({
          error: {
            message: '"email" must be a valid email',
            details: [{ message: '"email" must be a valid email' }],
          },
        }),
      };

      const middleware = validateRequest(mockSchema, 'body');
      const req: any = { body: { email: 'bad-email' }, id: 'req-test-123' };
      const res: any = {
        statusCode: 200,
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            requestId: 'req-test-123',
          }),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('passes through when validation succeeds', () => {
      const mockSchema = {
        validate: vi.fn().mockReturnValue({
          error: null,
          value: { email: 'doctor@healthsphere.org' },
        }),
      };

      const middleware = validateRequest(mockSchema, 'body');
      const req: any = { body: { email: 'doctor@healthsphere.org' } };
      const res: any = {};
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body.email).toBe('doctor@healthsphere.org');
    });
  });

  describe('Enterprise CORS Configuration', () => {
    it('returns valid CORS options with exposed headers and credentials', () => {
      const cors = configureCors();

      expect(cors.credentials).toBe(true);
      expect(cors.methods).toContain('GET');
      expect(cors.methods).toContain('POST');
      expect(cors.exposedHeaders).toContain('x-request-id');
      expect(cors.allowedHeaders).toContain('Authorization');
      expect(cors.allowedHeaders).toContain('x-request-id');
    });
  });

  describe('API Error Formatter', () => {
    it('formats errors uniformly with status, code, requestId, and timestamp', () => {
      const err: any = new Error('Patient record access forbidden');
      err.status = 403;
      err.code = 'FORBIDDEN';

      const req: any = {
        id: 'test-trace-id',
        originalUrl: '/api/v1/records/sensitive',
        method: 'GET',
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      apiErrorFormatter(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Patient record access forbidden',
        error: {
          code: 'FORBIDDEN',
          message: 'Patient record access forbidden',
          details: expect.anything(),
          requestId: 'test-trace-id',
          timestamp: expect.any(String),
        },
      });
    });
  });

  describe('Rate Limiters Verification', () => {
    it('exports all enterprise tiered rate limiters', () => {
      expect(typeof apiLimiter).toBe('function');
      expect(typeof authLimiter).toBe('function');
      expect(typeof sensitiveLimiter).toBe('function');
      expect(typeof chatLimiter).toBe('function');
    });
  });
});
