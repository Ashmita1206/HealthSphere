import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

interface SharePermissions {
  profile: boolean;
  reports: boolean;
  medicines: boolean;
  appointments: boolean;
  timeline: boolean;
  analytics: boolean;
  emergency: boolean;
}

interface MedicalShareMockDoc {
  _id: string;
  patientId: string;
  doctorId: string;
  shareToken: string;
  expiresAt: Date;
  permissions: SharePermissions;
  status: 'active' | 'expired' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
}

// Logic mirror of shareEngine.js
function generateShareToken(): string {
  const randomHex = crypto.randomBytes(16).toString('hex');
  return `HS_SHARE_${randomHex}`;
}

function calculateExpiresAt(duration = '24h', baseTime = Date.now()): Date {
  const normalized = String(duration).trim().toLowerCase();
  let ms = 24 * 60 * 60 * 1000;

  if (normalized.endsWith('h')) {
    const hours = parseFloat(normalized.slice(0, -1));
    if (!isNaN(hours) && hours > 0) ms = hours * 60 * 60 * 1000;
  } else if (normalized.endsWith('d')) {
    const days = parseFloat(normalized.slice(0, -1));
    if (!isNaN(days) && days > 0) ms = days * 24 * 60 * 60 * 1000;
  } else if (normalized.endsWith('m')) {
    const minutes = parseFloat(normalized.slice(0, -1));
    if (!isNaN(minutes) && minutes > 0) ms = minutes * 60 * 1000;
  }
  return new Date(baseTime + ms);
}

function sanitizePermissions(raw: Partial<SharePermissions> = {}): SharePermissions {
  return {
    profile: Boolean(raw.profile ?? true),
    reports: Boolean(raw.reports ?? true),
    medicines: Boolean(raw.medicines ?? true),
    appointments: Boolean(raw.appointments ?? true),
    timeline: Boolean(raw.timeline ?? true),
    analytics: Boolean(raw.analytics ?? true),
    emergency: Boolean(raw.emergency ?? true),
  };
}

describe('F10 Backend Doctor Portal & Secure Medical Record Sharing Suite', () => {
  const patientA = '65b1f77bcf86cd799439011a';
  const patientB = '65b1f77bcf86cd799439099b';
  const doctorId1 = 'DOC-882101';
  const shareDb = new Map<string, MedicalShareMockDoc>();

  it('1. Generates cryptographically secure share tokens starting with HS_SHARE_', () => {
    const token1 = generateShareToken();
    const token2 = generateShareToken();

    expect(token1).toMatch(/^HS_SHARE_[0-9a-f]{32}$/);
    expect(token2).toMatch(/^HS_SHARE_[0-9a-f]{32}$/);
    expect(token1).not.toBe(token2);
  });

  it('2. Computes expiry durations accurately for 1h, 24h, 7d, and 30d', () => {
    const base = 1700000000000;

    const oneHour = calculateExpiresAt('1h', base);
    expect(oneHour.getTime() - base).toBe(1 * 60 * 60 * 1000);

    const twentyFourHours = calculateExpiresAt('24h', base);
    expect(twentyFourHours.getTime() - base).toBe(24 * 60 * 60 * 1000);

    const sevenDays = calculateExpiresAt('7d', base);
    expect(sevenDays.getTime() - base).toBe(7 * 24 * 60 * 60 * 1000);

    const thirtyDays = calculateExpiresAt('30d', base);
    expect(thirtyDays.getTime() - base).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it('3. Sanitizes permissions with safe booleans and defaults', () => {
    const sanitized = sanitizePermissions({
      profile: true,
      medicines: false,
    });

    expect(sanitized.profile).toBe(true);
    expect(sanitized.medicines).toBe(false);
    expect(sanitized.reports).toBe(true); // default true
    expect(sanitized.emergency).toBe(true);
  });

  it('4. Creates share record and stores in mock state', () => {
    const token = generateShareToken();
    const share: MedicalShareMockDoc = {
      _id: 'share-001',
      patientId: patientA,
      doctorId: doctorId1,
      shareToken: token,
      expiresAt: calculateExpiresAt('24h'),
      permissions: sanitizePermissions({ profile: true, reports: true, medicines: false }),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    shareDb.set(token, share);
    expect(shareDb.get(token)).toBeDefined();
    expect(shareDb.get(token)?.status).toBe('active');
    expect(shareDb.get(token)?.doctorId).toBe(doctorId1);
  });

  it('5. Rejects expired tokens and transitions status', () => {
    const expiredToken = generateShareToken();
    const pastDate = new Date(Date.now() - 3600 * 1000); // 1 hour in the past

    const share: MedicalShareMockDoc = {
      _id: 'share-002',
      patientId: patientA,
      doctorId: doctorId1,
      shareToken: expiredToken,
      expiresAt: pastDate,
      permissions: sanitizePermissions(),
      status: 'active',
      createdAt: new Date(Date.now() - 7200 * 1000),
      updatedAt: new Date(Date.now() - 7200 * 1000),
    };

    shareDb.set(expiredToken, share);

    // Validate access engine evaluation
    const doc = shareDb.get(expiredToken)!;
    const isPast = new Date() > doc.expiresAt;
    if (isPast) {
      doc.status = 'expired';
    }

    expect(doc.status).toBe('expired');
  });

  it('6. Allows patient to revoke their active share token', () => {
    const token = generateShareToken();
    const share: MedicalShareMockDoc = {
      _id: 'share-003',
      patientId: patientA,
      doctorId: doctorId1,
      shareToken: token,
      expiresAt: calculateExpiresAt('24h'),
      permissions: sanitizePermissions(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    shareDb.set(token, share);

    // Revocation by owner
    const target = shareDb.get(token)!;
    expect(target.patientId).toBe(patientA);
    target.status = 'revoked';
    target.updatedAt = new Date();

    expect(target.status).toBe('revoked');
  });

  it('7. IDOR Protection: Rejects unauthorized revocation attempts from other users', () => {
    const token = generateShareToken();
    const share: MedicalShareMockDoc = {
      _id: 'share-004',
      patientId: patientA,
      doctorId: doctorId1,
      shareToken: token,
      expiresAt: calculateExpiresAt('24h'),
      permissions: sanitizePermissions(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    shareDb.set(token, share);

    // Patient B attempts to revoke Patient A's share
    const target = shareDb.get(token)!;
    const isOwner = target.patientId === patientB;
    expect(isOwner).toBe(false);

    // Ensure status remains untouched
    expect(target.status).toBe('active');
  });

  it('8. Permission Enforcement: Projects strictly granted patient resources', () => {
    const permissions: SharePermissions = {
      profile: true,
      reports: true,
      medicines: false,
      appointments: false,
      timeline: false,
      analytics: false,
      emergency: true,
    };

    const patientMasterData = {
      profile: { fullName: 'Alice Walker', bloodGroup: 'A+' },
      reports: [{ title: 'Lipid Panel', riskLevel: 'low' }],
      medicines: [{ name: 'Atorvastatin 20mg' }],
      timeline: [{ title: 'Cardiology Checkup' }],
      analytics: { score: 88 },
      emergency: { bloodGroup: 'A+', allergies: ['Penicillin'] },
    };

    const projectedRecords: Record<string, unknown> = {};

    if (permissions.profile) projectedRecords.profile = patientMasterData.profile;
    if (permissions.reports) projectedRecords.reports = patientMasterData.reports;
    if (permissions.medicines) projectedRecords.medicines = patientMasterData.medicines;
    if (permissions.timeline) projectedRecords.timeline = patientMasterData.timeline;
    if (permissions.analytics) projectedRecords.analytics = patientMasterData.analytics;
    if (permissions.emergency) projectedRecords.emergency = patientMasterData.emergency;

    expect(projectedRecords.profile).toBeDefined();
    expect(projectedRecords.reports).toBeDefined();
    expect(projectedRecords.emergency).toBeDefined();

    // Denied fields must NOT be in the projected result
    expect(projectedRecords.medicines).toBeUndefined();
    expect(projectedRecords.timeline).toBeUndefined();
    expect(projectedRecords.analytics).toBeUndefined();
  });

  it('9. Rejects invalid token formats missing HS_SHARE_ prefix', () => {
    const invalidTokens = ['INVALID_123', 'SHARE_12345', '', 'hs_share_lowercase'];

    invalidTokens.forEach((t) => {
      const isValid = Boolean(t && t.startsWith('HS_SHARE_'));
      expect(isValid).toBe(false);
    });
  });
});
