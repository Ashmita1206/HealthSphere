import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

// Reusable crypto & security helpers mirror for tests
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TEST_KEY = crypto.createHash('sha256').update('test-secret-key-32-chars-long!').digest();

function encryptTest(plaintext: string | object, key = TEST_KEY) {
  const text = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    combined: `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted,
  };
}

function decryptTest(combined: string, key = TEST_KEY) {
  const [ivHex, authTagHex, encryptedHex] = combined.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateTotpSecretTest(length = 20): string {
  const bytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32];
  }
  return secret;
}

function base32ToBuffer(base32: string): Buffer {
  const cleaned = base32.replace(/=+$/, '').toUpperCase();
  let bits = '';
  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTotpTokenTest(secret: string, timeStep = Math.floor(Date.now() / 1000 / 30)): string {
  const key = base32ToBuffer(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(timeStep));
  const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (binaryCode % 1000000).toString().padStart(6, '0');
}

function verifyTotpTokenTest(secret: string, token: string, window = 1): boolean {
  if (!secret || !token) return false;
  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let i = -window; i <= window; i++) {
    const expected = generateTotpTokenTest(secret, currentStep + i);
    if (token === expected) return true;
  }
  return false;
}

function generateEmergencyRecoveryCodesTest(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = `${crypto.randomBytes(3).toString('hex').toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    codes.push(code);
  }
  return codes;
}

function calculatePasswordEntropy(pw: string): number {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score += 20;
  if (pw.length >= 12) score += 20;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 20;
  if (/\d/.test(pw)) score += 20;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 20;
  return score;
}

// RBAC matrix
const PERMISSIONS = {
  READ_OWN_RECORDS: 'record:read:own',
  WRITE_OWN_RECORDS: 'record:write:own',
  READ_PATIENT_RECORDS: 'patient:read',
  WRITE_PATIENT_RECORDS: 'patient:write',
  PRESCRIBE_MEDICATION: 'medication:prescribe',
  EMERGENCY_BREAK_GLASS: 'emergency:break_glass',
  VIEW_AUDIT_LOGS: 'audit:view',
  REVOKE_ALL_SESSIONS: 'security:sessions:global_revoke',
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  patient: [PERMISSIONS.READ_OWN_RECORDS, PERMISSIONS.WRITE_OWN_RECORDS],
  doctor: [
    PERMISSIONS.READ_OWN_RECORDS,
    PERMISSIONS.WRITE_OWN_RECORDS,
    PERMISSIONS.READ_PATIENT_RECORDS,
    PERMISSIONS.WRITE_PATIENT_RECORDS,
    PERMISSIONS.PRESCRIBE_MEDICATION,
    PERMISSIONS.EMERGENCY_BREAK_GLASS,
  ],
  nurse: [PERMISSIONS.READ_PATIENT_RECORDS, PERMISSIONS.WRITE_PATIENT_RECORDS],
  paramedic: [PERMISSIONS.EMERGENCY_BREAK_GLASS, PERMISSIONS.READ_PATIENT_RECORDS],
  admin: Object.values(PERMISSIONS),
};

function hasPermissionTest(role: string, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

describe('F35 Enterprise Security Platform', () => {
  describe('AES-256-GCM Cryptographic Engine', () => {
    it('encrypts and decrypts string payloads correctly with authenticated tags', () => {
      const sensitiveData = 'Patient SSN: 000-12-3456, Chronic Diagnosis: Stage 2 Hypertension';
      const enc = encryptTest(sensitiveData);
      expect(enc.combined).toContain(':');
      expect(enc.iv).toHaveLength(24); // 12 bytes hex
      expect(enc.authTag).toHaveLength(32); // 16 bytes hex

      const dec = decryptTest(enc.combined);
      expect(dec).toBe(sensitiveData);
    });

    it('encrypts and decrypts nested JSON health record objects', () => {
      const healthRecord = {
        patientId: 'P-99281',
        vitals: { systolic: 120, diastolic: 80, pulse: 72 },
        medications: ['Lisinopril 10mg', 'Atorvastatin 20mg'],
      };
      const enc = encryptTest(healthRecord);
      const dec = decryptTest(enc.combined);
      expect(dec).toEqual(healthRecord);
    });

    it('detects tampering and throws error on ciphertext alteration', () => {
      const enc = encryptTest('Confidential Clinical Note');
      const parts = enc.combined.split(':');
      const tamperedEncrypted = parts[2].slice(0, -2) + 'ff';
      const tamperedCombined = `${parts[0]}:${parts[1]}:${tamperedEncrypted}`;

      expect(() => decryptTest(tamperedCombined)).toThrow();
    });
  });

  describe('RFC 6238 TOTP Two-Factor Authentication', () => {
    it('generates valid Base32 secret keys', () => {
      const secret = generateTotpSecretTest();
      expect(secret).toMatch(/^[A-Z2-7]{20}$/);
    });

    it('generates 6-digit numeric TOTP tokens', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = generateTotpTokenTest(secret);
      expect(token).toMatch(/^\d{6}$/);
    });

    it('verifies valid TOTP tokens within time window tolerance', () => {
      const secret = generateTotpSecretTest();
      const validToken = generateTotpTokenTest(secret);
      expect(verifyTotpTokenTest(secret, validToken)).toBe(true);
    });

    it('rejects invalid or forged TOTP tokens', () => {
      const secret = generateTotpSecretTest();
      expect(verifyTotpTokenTest(secret, '000000')).toBe(false);
      expect(verifyTotpTokenTest(secret, '999999')).toBe(false);
    });
  });

  describe('Emergency Recovery & Break-Glass Protocol', () => {
    it('generates 8 unique hyphenated single-use emergency recovery codes', () => {
      const codes = generateEmergencyRecoveryCodesTest(8);
      expect(codes).toHaveLength(8);
      const set = new Set(codes);
      expect(set.size).toBe(8);
      codes.forEach((code) => {
        expect(code).toMatch(/^[A-F0-9]{6}-[A-F0-9]{6}$/);
      });
    });

    it('creates expirable break-glass emergency trauma access token payload', () => {
      const patientId = 'PATIENT-884';
      const doctorId = 'DOC-ER-01';
      const reason = 'Acute traumatic cardiac arrest in ER';
      const payload = {
        type: 'EMERGENCY_BREAK_GLASS',
        patientId,
        doctorId,
        reason,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 2 * 3600 * 1000,
      };

      const encrypted = encryptTest(payload);
      const decrypted = decryptTest(encrypted.combined);
      expect(decrypted.type).toBe('EMERGENCY_BREAK_GLASS');
      expect(decrypted.patientId).toBe(patientId);
      expect(decrypted.doctorId).toBe(doctorId);
      expect(decrypted.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('Role-Based Access Control (RBAC) Matrix', () => {
    it('grants patients own record access but denies general patient records & prescribing', () => {
      expect(hasPermissionTest('patient', PERMISSIONS.READ_OWN_RECORDS)).toBe(true);
      expect(hasPermissionTest('patient', PERMISSIONS.WRITE_OWN_RECORDS)).toBe(true);
      expect(hasPermissionTest('patient', PERMISSIONS.READ_PATIENT_RECORDS)).toBe(false);
      expect(hasPermissionTest('patient', PERMISSIONS.PRESCRIBE_MEDICATION)).toBe(false);
    });

    it('grants doctors prescribing and break-glass emergency access', () => {
      expect(hasPermissionTest('doctor', PERMISSIONS.PRESCRIBE_MEDICATION)).toBe(true);
      expect(hasPermissionTest('doctor', PERMISSIONS.EMERGENCY_BREAK_GLASS)).toBe(true);
      expect(hasPermissionTest('doctor', PERMISSIONS.READ_PATIENT_RECORDS)).toBe(true);
      expect(hasPermissionTest('doctor', PERMISSIONS.REVOKE_ALL_SESSIONS)).toBe(false);
    });

    it('grants paramedics emergency break-glass but denies prescribing', () => {
      expect(hasPermissionTest('paramedic', PERMISSIONS.EMERGENCY_BREAK_GLASS)).toBe(true);
      expect(hasPermissionTest('paramedic', PERMISSIONS.PRESCRIBE_MEDICATION)).toBe(false);
    });

    it('grants admin all permissions including audit logs and global session revocation', () => {
      expect(hasPermissionTest('admin', PERMISSIONS.VIEW_AUDIT_LOGS)).toBe(true);
      expect(hasPermissionTest('admin', PERMISSIONS.REVOKE_ALL_SESSIONS)).toBe(true);
      expect(hasPermissionTest('admin', PERMISSIONS.PRESCRIBE_MEDICATION)).toBe(true);
    });
  });

  describe('Password Security & Entropy Scoring', () => {
    it('scores weak passwords low and strong complex passwords at 100%', () => {
      expect(calculatePasswordEntropy('short')).toBe(0);
      expect(calculatePasswordEntropy('weakpass1')).toBe(40); // >=8 chars + numbers
      expect(calculatePasswordEntropy('StrongP@ssw0rd!2026')).toBe(100);
    });
  });
});
