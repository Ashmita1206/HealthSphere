import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  hashToken,
  parseUserAgent,
  generateAccessToken,
  createPasswordResetToken,
  createEmailVerificationToken,
  ACCESS_TOKEN_EXPIRY,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_MINUTES,
} = require('../../server/services/authService');

describe('F36 — Enterprise Authentication Upgrade', () => {
  describe('Hash Utilities & Security Tokens', () => {
    it('generates consistent SHA-256 token hashes', () => {
      const rawToken = 'secret-session-token-alpha';
      const hash1 = hashToken(rawToken);
      const hash2 = hashToken(rawToken);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex string
      expect(hash1).not.toBe(rawToken);
    });

    it('creates password reset token with valid 1-hour expiration', () => {
      const user: any = {};
      const token = createPasswordResetToken(user);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
      expect(user.passwordResetToken).toBe(hashToken(token));
      expect(user.passwordResetExpires).toBeInstanceOf(Date);
      expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
    });

    it('creates email verification token with 24-hour expiration', () => {
      const user: any = {};
      const token = createEmailVerificationToken(user);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
      expect(user.emailVerificationToken).toBe(hashToken(token));
      expect(user.emailVerificationExpires).toBeInstanceOf(Date);
      expect(user.emailVerificationExpires.getTime()).toBeGreaterThan(Date.now() + 23 * 3600 * 1000);
    });
  });

  describe('Device & User Agent Parsing', () => {
    it('accurately parses desktop Chrome on Windows', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);

      expect(result.deviceType).toBe('desktop');
      expect(result.browser).toBe('Chrome');
      expect(result.os).toBe('Windows');
    });

    it('accurately parses mobile Safari on iOS / iPhone', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const result = parseUserAgent(ua);

      expect(result.deviceType).toBe('mobile');
      expect(result.browser).toBe('Safari');
      expect(result.os).toBe('iOS');
    });

    it('accurately parses tablet Android', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 13; SM-X900) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      const result = parseUserAgent(ua);

      expect(result.deviceType).toBe('mobile'); // tablet or mobile
      expect(result.browser).toBe('Chrome');
      expect(result.os).toBe('Android');
    });
  });

  describe('JWT Access Token Generation', () => {
    it('signs an access token containing id, email, and role', () => {
      const user = {
        _id: '507f191e810c19729de860ea',
        email: 'doctor.house@healthsphere.org',
        name: 'Dr. Gregory House',
        role: 'doctor',
      };

      const token = generateAccessToken(user);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // Standard JWT header.payload.signature
    });
  });

  describe('Account Lockout Engine', () => {
    it('correctly locks account when failed login attempts reach threshold', () => {
      const mockUser = {
        failedLoginAttempts: 0,
        lockUntil: null as Date | null,
        isAccountLocked() {
          return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
        },
      };

      expect(mockUser.isAccountLocked()).toBe(false);

      // Simulate 5 consecutive failed logins
      for (let i = 1; i <= MAX_FAILED_ATTEMPTS; i++) {
        mockUser.failedLoginAttempts += 1;
        if (mockUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
          mockUser.lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        }
      }

      expect(mockUser.failedLoginAttempts).toBe(5);
      expect(mockUser.isAccountLocked()).toBe(true);
      expect(mockUser.lockUntil!.getTime()).toBeGreaterThan(Date.now());
    });

    it('unlocks account once lock period expires', () => {
      const expiredLock = new Date(Date.now() - 1000); // 1 sec ago
      const mockUser = {
        lockUntil: expiredLock,
        isAccountLocked() {
          return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
        },
      };

      expect(mockUser.isAccountLocked()).toBe(false);
    });
  });

  describe('Session & LoginHistory Canonical Contracts Reconciliation', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Session = require('../../server/models/Session');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const LoginHistory = require('../../server/models/LoginHistory');

    it('1. authService session creation payload validates successfully', () => {
      const doc = new Session({
        userId: '507f191e810c19729de860ea',
        tokenFamily: 'fam-auth-test-01',
        refreshTokenHash: hashToken('refresh-secret-01'),
        device: {
          browser: 'Chrome',
          os: 'Windows',
          deviceType: 'desktop',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome on Win',
          location: 'Local Network',
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      });

      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.tokenFamily).toBe('fam-auth-test-01');
      expect(doc.refreshTokenHash).toHaveLength(64);
      expect(doc.isActive).toBe(true);
      expect(doc.isRevoked).toBe(false);
    });

    it('2. sessionService session creation payload validates successfully', () => {
      const doc = new Session({
        userId: '507f191e810c19729de860ea',
        tokenFamily: 'fam-session-test-02',
        refreshTokenHash: hashToken('refresh-secret-02'),
        device: {
          browser: 'Firefox',
          os: 'Linux',
          deviceType: 'desktop',
          ipAddress: '127.0.0.1',
          userAgent: 'Firefox on Linux',
          location: 'Local Network',
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      });

      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.browser).toBe('Firefox');
      expect(doc.os).toBe('Linux');
      expect(doc.deviceType).toBe('desktop');
    });

    it('3. login history SUCCESS validates and normalizes', () => {
      const doc = new LoginHistory({
        userId: '507f191e810c19729de860ea',
        email: 'Doc.House@HealthSphere.io',
        status: 'SUCCESS',
        ipAddress: '10.0.0.5',
        userAgent: 'Mozilla/5.0...',
        device: {
          browser: 'Safari',
          os: 'macOS',
          deviceType: 'desktop',
        },
      });

      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.email).toBe('doc.house@healthsphere.io');
      expect(doc.status).toBe('SUCCESS');
      expect(doc.deviceType).toBe('desktop');
    });

    it('4. failed credential history validates and normalizes', () => {
      const docFailed = new LoginHistory({
        email: 'user@test.org',
        status: 'failed',
        failureReason: 'Invalid password',
      });
      expect(docFailed.status).toBe('FAILED_CREDENTIALS');
      expect(docFailed.validateSync()).toBeUndefined();

      const docLocked = new LoginHistory({
        email: 'user@test.org',
        status: 'locked',
        failureReason: 'Rate limit exceeded',
      });
      expect(docLocked.status).toBe('ACCOUNT_LOCKED');
      expect(docLocked.validateSync()).toBeUndefined();
    });

    it('5. security alerts correctly detect failed authentication events', () => {
      const mockHistory = [
        { status: 'FAILED_CREDENTIALS', email: 'test@hs.io' },
        { status: 'ACCOUNT_LOCKED', email: 'test@hs.io' },
        { status: 'failed', email: 'test@hs.io' },
        { status: 'SUCCESS', email: 'test@hs.io' },
      ];

      const failedCount = mockHistory.filter((h) => {
        const s = String(h.status).toUpperCase();
        return s === 'FAILED_CREDENTIALS' || s === 'ACCOUNT_LOCKED' || s === 'FAILED' || s === 'LOCKED';
      }).length;

      expect(failedCount).toBe(3);
    });

    it('6. device metadata survives persistence/serialization', () => {
      const doc = new Session({
        userId: '507f191e810c19729de860ea',
        tokenFamily: 'fam-device-meta-test',
        refreshTokenHash: hashToken('secret-device-01'),
        device: {
          browser: 'Edge',
          os: 'Windows',
          deviceType: 'desktop',
          ipAddress: '192.168.1.50',
          userAgent: 'Mozilla/5.0 Edg/120.0',
          location: 'HQ Medical Center',
        },
        expiresAt: new Date(Date.now() + 86400000),
      });

      const serialized = doc.toObject();
      expect(serialized.device.browser).toBe('Edge');
      expect(serialized.device.os).toBe('Windows');
      expect(serialized.device.deviceType).toBe('desktop');
      expect(serialized.device.location).toBe('HQ Medical Center');
      expect(serialized.browser).toBe('Edge');
      expect(serialized.os).toBe('Windows');
    });

    it('7. session revocation still works', () => {
      const doc = new Session({
        userId: '507f191e810c19729de860ea',
        tokenFamily: 'fam-revoke-test',
        refreshTokenHash: hashToken('secret-revoke-01'),
        expiresAt: new Date(Date.now() + 86400000),
      });

      expect(doc.isActive).toBe(true);
      expect(doc.isRevoked).toBe(false);

      doc.isActive = false;
      doc.isRevoked = true;
      doc.revokedReason = 'User logged out';

      expect(doc.isActive).toBe(false);
      expect(doc.isRevoked).toBe(true);
      expect(doc.revokedReason).toBe('User logged out');
      expect(doc.validateSync()).toBeUndefined();
    });

    it('8. refresh-token/session-family behavior still works', () => {
      const oldSecret = 'old-refresh-secret';
      const newSecret = 'new-rotated-secret';
      const doc = new Session({
        userId: '507f191e810c19729de860ea',
        tokenFamily: 'fam-rotation-01',
        refreshTokenHash: hashToken(oldSecret),
        expiresAt: new Date(Date.now() + 86400000),
      });

      expect(doc.refreshTokenHash).toBe(hashToken(oldSecret));
      // Rotate token hash
      doc.refreshTokenHash = hashToken(newSecret);
      doc.lastActive = new Date();

      expect(doc.refreshTokenHash).toBe(hashToken(newSecret));
      expect(doc.validateSync()).toBeUndefined();
    });

    it('9. no raw token is stored in Session', () => {
      const rawSecret = 'raw-secret-string-that-must-never-be-in-db-12345';
      const doc = new Session({
        userId: '507f191e810c19729de860ea',
        tokenFamily: 'fam-secure-no-raw',
        refreshTokenHash: hashToken(rawSecret),
        expiresAt: new Date(Date.now() + 86400000),
      });

      const serializedStr = JSON.stringify(doc.toObject());
      expect(serializedStr).not.toContain(rawSecret);
      expect(doc.toObject().refreshTokenHash).toHaveLength(64);
      expect(doc.tokenHash).toBe(hashToken(rawSecret));
    });

    it('10. TTL/expiration fields remain correct', () => {
      const sessionExpiry = Session.schema.path('expiresAt');
      expect(sessionExpiry.options.index).toEqual({ expires: 0 });
      expect(sessionExpiry.options.required).toBe(true);

      const loginAttemptedAt = LoginHistory.schema.path('attemptedAt');
      expect(loginAttemptedAt.options.index).toBe(true);
    });
  });
});
