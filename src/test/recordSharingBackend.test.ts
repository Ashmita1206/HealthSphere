import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

interface Permissions {
  medicalProfile: boolean;
  reports: boolean;
  medicines: boolean;
  appointments: boolean;
  timeline: boolean;
  healthAnalytics: boolean;
}

interface AccessLog {
  accessedAt: Date;
  ipAddress: string;
  userAgent: string;
  accessorId?: string | null;
}

interface RecordShareMockDoc {
  _id: string;
  patientId: string;
  doctorId: string;
  records: string[];
  permissions: Permissions;
  accessToken: string;
  expiresAt: Date;
  accessHistory: AccessLog[];
  createdAt: Date;
  updatedAt: Date;
}

describe('Secure Medical Record Sharing Backend Suite', () => {
  const shareDb = new Map<string, RecordShareMockDoc>();
  const patientA = 'patient-001';
  const patientB = 'patient-002';
  const doctor1 = 'doctor-001';

  function generateToken() {
    return `HS_SHARE_${crypto.randomBytes(16).toString('hex')}`;
  }

  function createShare(
    callerPatientId: string,
    payload: {
      doctorId?: string;
      records?: string[];
      permissions?: Partial<Permissions>;
      durationHours?: number;
    }
  ) {
    if (!callerPatientId) return { status: 401, error: 'Unauthorized' };
    if (!payload.doctorId) return { status: 400, error: 'doctorId is required' };

    const token = generateToken();
    const expiresAt = new Date(Date.now() + (payload.durationHours || 24) * 3600 * 1000);

    const hasExplicitPermissions = payload.permissions && typeof payload.permissions === 'object' && Object.keys(payload.permissions).length > 0;
    const permissions: Permissions = {
      medicalProfile: hasExplicitPermissions ? Boolean(payload.permissions?.medicalProfile) : true,
      reports: hasExplicitPermissions ? Boolean(payload.permissions?.reports) : true,
      medicines: hasExplicitPermissions ? Boolean(payload.permissions?.medicines) : true,
      appointments: hasExplicitPermissions ? Boolean(payload.permissions?.appointments) : true,
      timeline: hasExplicitPermissions ? Boolean(payload.permissions?.timeline) : true,
      healthAnalytics: hasExplicitPermissions ? Boolean(payload.permissions?.healthAnalytics) : true,
    };

    const newShare: RecordShareMockDoc = {
      _id: `share-${Date.now()}`,
      patientId: callerPatientId,
      doctorId: payload.doctorId,
      records: payload.records || ['medicalProfile', 'reports', 'medicines'],
      permissions,
      accessToken: token,
      expiresAt,
      accessHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    shareDb.set(token, newShare);
    return { status: 201, data: newShare };
  }

  function accessRecordsByToken(
    token: string,
    meta: { ip?: string; userAgent?: string; accessorId?: string }
  ) {
    if (!token) return { status: 400, error: 'Token is required' };
    const share = shareDb.get(token);
    if (!share) return { status: 404, error: 'Share token not found' };

    if (new Date() > share.expiresAt) {
      return { status: 410, error: 'Share link has expired', expiresAt: share.expiresAt };
    }

    // Access logging
    share.accessHistory.push({
      accessedAt: new Date(),
      ipAddress: meta.ip || '127.0.0.1',
      userAgent: meta.userAgent || 'Mozilla/5.0',
      accessorId: meta.accessorId || null,
    });

    // Mock patient master data
    const masterData = {
      medicalProfile: { bloodGroup: 'O+', allergies: ['Aspirin'] },
      reports: [{ title: 'Lipid Panel', value: 'Normal' }],
      medicines: [{ name: 'Metformin 500mg' }],
      appointments: [{ date: '2026-10-01' }],
      timeline: [{ event: 'Annual Wellness Visit' }],
      healthAnalytics: { score: 85 },
    };

    // Strict projection: only granted permissions are returned
    const projected: Record<string, unknown> = {};
    if (share.permissions.medicalProfile) projected.medicalProfile = masterData.medicalProfile;
    if (share.permissions.reports) projected.reports = masterData.reports;
    if (share.permissions.medicines) projected.medicines = masterData.medicines;
    if (share.permissions.appointments) projected.appointments = masterData.appointments;
    if (share.permissions.timeline) projected.timeline = masterData.timeline;
    if (share.permissions.healthAnalytics) projected.healthAnalytics = masterData.healthAnalytics;

    return {
      status: 200,
      data: {
        accessToken: share.accessToken,
        expiresAt: share.expiresAt,
        records: projected,
        accessCount: share.accessHistory.length,
      },
    };
  }

  function deleteShare(callerPatientId: string, shareId: string) {
    if (!callerPatientId) return { status: 401, error: 'Unauthorized' };

    let foundToken = '';
    let targetShare: RecordShareMockDoc | null = null;
    for (const [token, share] of shareDb.entries()) {
      if (share._id === shareId) {
        foundToken = token;
        targetShare = share;
        break;
      }
    }

    if (!targetShare) return { status: 404, error: 'Share not found' };

    // IDOR check: caller must be the patient owner
    if (targetShare.patientId !== callerPatientId) {
      return { status: 403, error: 'Unauthorized: You can only delete your own shares' };
    }

    shareDb.delete(foundToken);
    return { status: 200, message: 'Share revoked successfully' };
  }

  it('1. Generates secure HS_SHARE_ token and stores share configuration', () => {
    shareDb.clear();
    const res = createShare(patientA, {
      doctorId: doctor1,
      permissions: { medicalProfile: true, reports: true, medicines: false },
      durationHours: 24,
    });

    expect(res.status).toBe(201);
    expect(res.data?.accessToken).toMatch(/^HS_SHARE_[0-9a-f]{32}$/);
    expect(res.data?.permissions.medicines).toBe(false);
    expect(res.data?.permissions.reports).toBe(true);
  });

  it('2. Enforces granular permission projection (denied resources are omitted)', () => {
    const created = createShare(patientA, {
      doctorId: doctor1,
      permissions: { medicalProfile: true, reports: true, medicines: false },
    });

    const accessRes = accessRecordsByToken(created.data!.accessToken, {
      ip: '192.168.1.50',
      userAgent: 'ClinicalViewer/1.0',
    });

    expect(accessRes.status).toBe(200);
    const records = accessRes.data!.records as Record<string, unknown>;

    // Granted permissions exist
    expect(records.medicalProfile).toBeDefined();
    expect(records.reports).toBeDefined();

    // Denied permissions must be undefined
    expect(records.medicines).toBeUndefined();
    expect(records.appointments).toBeUndefined();
    expect(records.healthAnalytics).toBeUndefined();
  });

  it('3. Logs access attempts in accessHistory for security audits', () => {
    const created = createShare(patientA, { doctorId: doctor1 });

    accessRecordsByToken(created.data!.accessToken, {
      ip: '10.0.0.1',
      userAgent: 'HospitalPortal/3.2',
    });
    accessRecordsByToken(created.data!.accessToken, {
      ip: '10.0.0.2',
      userAgent: 'MobileClinic/2.0',
    });

    const doc = shareDb.get(created.data!.accessToken)!;
    expect(doc.accessHistory.length).toBe(2);
    expect(doc.accessHistory[0].ipAddress).toBe('10.0.0.1');
    expect(doc.accessHistory[1].userAgent).toBe('MobileClinic/2.0');
  });

  it('4. Rejects expired share tokens with 410 Gone', () => {
    const expiredToken = generateToken();
    const expiredDoc: RecordShareMockDoc = {
      _id: 'share-expired',
      patientId: patientA,
      doctorId: doctor1,
      records: ['medicalProfile'],
      permissions: {
        medicalProfile: true,
        reports: true,
        medicines: true,
        appointments: true,
        timeline: true,
        healthAnalytics: true,
      },
      accessToken: expiredToken,
      expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hour past
      accessHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    shareDb.set(expiredToken, expiredDoc);

    const accessRes = accessRecordsByToken(expiredToken, {});
    expect(accessRes.status).toBe(410);
    expect(accessRes.error).toMatch(/expired/i);
  });

  it('5. Rejects invalid or nonexistent tokens with 404', () => {
    const res = accessRecordsByToken('HS_SHARE_nonexistenttoken999', {});
    expect(res.status).toBe(404);
  });

  it('6. IDOR Protection: Patient B cannot revoke Patient A share', () => {
    const created = createShare(patientA, { doctorId: doctor1 });
    const shareId = created.data!._id;

    // Attacker patientB attempts deletion
    const attackerRes = deleteShare(patientB, shareId);
    expect(attackerRes.status).toBe(403);
    expect(attackerRes.error).toMatch(/Unauthorized/i);

    // Share still exists in DB
    expect(shareDb.has(created.data!.accessToken)).toBe(true);

    // Legitimate owner patientA can delete
    const ownerRes = deleteShare(patientA, shareId);
    expect(ownerRes.status).toBe(200);
    expect(shareDb.has(created.data!.accessToken)).toBe(false);
  });
});
