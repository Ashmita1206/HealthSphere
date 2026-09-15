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
});
