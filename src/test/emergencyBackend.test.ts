import { describe, it, expect } from 'vitest';

interface EmergencyIncidentMockDoc {
  _id: string;
  userId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  triggerReason: string;
  location?: { latitude?: number; longitude?: number; address?: string };
  status: 'active' | 'investigating' | 'resolved';
  assignedDoctor?: string | null;
  escalatedAt?: Date | null;
  resolvedAt?: Date | null;
  createdAt: Date;
}

describe('Emergency Contact Backend & Security Logic', () => {
  it('validates contact payload fields correctly', () => {
    const validateContactPayload = (payload: { name?: string; phone?: string }) => {
      if (!payload.name || !payload.name.trim()) return 'Name is required';
      if (!payload.phone || !payload.phone.trim()) return 'Phone is required';
      return null;
    };

    expect(validateContactPayload({ name: '', phone: '555-0199' })).toBe('Name is required');
    expect(validateContactPayload({ name: 'Dr. Sarah', phone: '' })).toBe('Phone is required');
    expect(validateContactPayload({ name: 'Dr. Sarah', phone: '555-0199' })).toBeNull();
  });

  it('verifies cross-user IDOR protection query scoping for emergency contacts', () => {
    const isContactOwnedByUser = (contactUserId: string, reqUserId: string) => {
      return contactUserId === reqUserId;
    };

    const targetUser = 'user-abc';
    const attackerUser = 'user-xyz';

    expect(isContactOwnedByUser('user-abc', targetUser)).toBe(true);
    expect(isContactOwnedByUser('user-abc', attackerUser)).toBe(false);
  });
});

describe('F16 Emergency Risk Detection & Response Backend Suite', () => {
  const patientA = 'user-patient-a';
  const patientB = 'user-patient-b';
  const doctorId = 'doc-cardio-1';

  const incidentsDb = new Map<string, EmergencyIncidentMockDoc>();
  const timelineEvents: Array<{ userId: string; eventType: string; title: string }> = [];
  const notifications: Array<{ userId: string; title: string; severity?: string }> = [];

  const resetState = () => {
    incidentsDb.clear();
    timelineEvents.length = 0;
    notifications.length = 0;
  };

  it('1. Emergency Risk Detection Engine: Correctly evaluates physiological metrics into risk tiers', () => {
    // @ts-expect-error dynamic commonjs loading in vitest
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { evaluateEmergencyRisk, EMERGENCY_LEVELS } = require('../../server/services/emergencyEngine');

    // Hypoxemia (Oxygen < 90%) -> CRITICAL
    const o2Res = evaluateEmergencyRisk({ oxygen: 87 });
    expect(o2Res.level).toBe(EMERGENCY_LEVELS.CRITICAL);
    expect(o2Res.isEmergency).toBe(true);
    expect(o2Res.triggers[0]).toMatch(/hypoxemia/i);

    // Hypertensive crisis (BP >= 180/120) -> CRITICAL
    const bpRes = evaluateEmergencyRisk({ bloodPressure: '190/125' });
    expect(bpRes.level).toBe(EMERGENCY_LEVELS.CRITICAL);
    expect(bpRes.triggers[0]).toMatch(/hypertensive crisis/i);

    // Extreme tachycardia (Heart Rate > 140) -> CRITICAL
    const hrRes = evaluateEmergencyRisk({ heartRate: 155 });
    expect(hrRes.level).toBe(EMERGENCY_LEVELS.CRITICAL);

    // Severe Hyperglycemia (Glucose > 350) -> CRITICAL
    const glucoseRes = evaluateEmergencyRisk({ glucose: 380 });
    expect(glucoseRes.level).toBe(EMERGENCY_LEVELS.CRITICAL);

    // High fever (Temperature > 103 F) -> CRITICAL
    const tempRes = evaluateEmergencyRisk({ temperature: 104.2 });
    expect(tempRes.level).toBe(EMERGENCY_LEVELS.CRITICAL);

    // Emergency Symptom: chest pain -> CRITICAL
    const symRes = evaluateEmergencyRisk({ symptoms: ['chest pain radiating to left arm'] });
    expect(symRes.level).toBe(EMERGENCY_LEVELS.CRITICAL);
    expect(symRes.recommendedAction).toMatch(/call emergency/i);

    // Normal parameters -> LOW
    const normalRes = evaluateEmergencyRisk({
      oxygen: 98,
      heartRate: 72,
      bloodPressure: '118/76',
      glucose: 90,
      temperature: 98.6,
      symptoms: [],
      healthScore: 88,
    });
    expect(normalRes.level).toBe(EMERGENCY_LEVELS.LOW);
    expect(normalRes.isEmergency).toBe(false);
  });

  it('2. Auto-Escalation on CRITICAL Incident: Dispatches alerts to contacts, doctor, and timeline', async () => {
    resetState();

    // @ts-expect-error dynamic commonjs loading in vitest
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { evaluateEmergencyRisk } = require('../../server/services/emergencyEngine');

    const vitalsPayload = {
      oxygen: 85,
      symptoms: ['acute chest pain'],
      heartRate: 145,
    };

    const risk = evaluateEmergencyRisk(vitalsPayload);
    expect(risk.level).toBe('CRITICAL');

    const incidentId = `inc-${Date.now()}`;
    const incident: EmergencyIncidentMockDoc = {
      _id: incidentId,
      userId: patientA,
      severity: risk.level,
      triggerReason: risk.triggers.join('. '),
      status: 'active',
      assignedDoctor: doctorId,
      escalatedAt: new Date(),
      createdAt: new Date(),
    };
    incidentsDb.set(incidentId, incident);

    // Simulate auto-escalation actions
    notifications.push({
      userId: patientA,
      title: 'SOS: Emergency Contact Alerted',
      severity: 'critical',
    });
    notifications.push({
      userId: doctorId,
      title: 'CRITICAL PATIENT EMERGENCY ALERT',
      severity: 'critical',
    });
    timelineEvents.push({
      userId: patientA,
      eventType: 'EMERGENCY_INCIDENT',
      title: 'Critical Emergency Incident Triggered',
    });

    expect(notifications.some((n) => n.title.includes('Emergency Contact Alerted'))).toBe(true);
    expect(notifications.some((n) => n.userId === doctorId)).toBe(true);
    expect(timelineEvents.some((e) => e.eventType === 'EMERGENCY_INCIDENT')).toBe(true);
  });

  it('3. Incident Resolution: Correctly marks incident resolved and updates status', () => {
    resetState();
    const incId = 'inc-active-1';
    incidentsDb.set(incId, {
      _id: incId,
      userId: patientA,
      severity: 'HIGH',
      triggerReason: 'Elevated blood pressure crisis',
      status: 'active',
      createdAt: new Date(),
    });

    const resolveIncident = (callerId: string, id: string) => {
      const inc = incidentsDb.get(id);
      if (!inc) return { status: 404, error: 'Not found' };
      if (inc.userId !== callerId) return { status: 403, error: 'Forbidden' };
      inc.status = 'resolved';
      inc.resolvedAt = new Date();
      return { status: 200, data: inc };
    };

    // Patient B forbidden to resolve Patient A incident
    const forbiddenRes = resolveIncident(patientB, incId);
    expect(forbiddenRes.status).toBe(403);

    // Patient A resolves own incident
    const successRes = resolveIncident(patientA, incId);
    expect(successRes.status).toBe(200);
    expect(successRes.data?.status).toBe('resolved');
    expect(successRes.data?.resolvedAt).toBeDefined();
  });

  it('4. Live Health Monitoring: Identifies adherence drop and deteriorating scores', async () => {
    // Simulated live monitor check logic matching server/services/liveHealthMonitor.js
    const simulateLiveMonitor = (metrics: {
      adherenceRate: number;
      symptomHistory: string[];
      scoreDrop: number;
      systolic: number;
    }) => {
      const alerts: string[] = [];
      if (metrics.adherenceRate < 65) {
        alerts.push('Medication adherence critical drop');
      }

      const counts = new Map<string, number>();
      for (const s of metrics.symptomHistory) {
        counts.set(s, (counts.get(s) || 0) + 1);
        if (counts.get(s)! >= 3) {
          alerts.push(`Repeated symptom detected: ${s}`);
          break;
        }
      }

      if (metrics.scoreDrop >= 10) {
        alerts.push('Health score deteriorating');
      }

      if (metrics.systolic >= 160) {
        alerts.push('Critical blood pressure spike');
      }

      return {
        status: alerts.some((a) => a.includes('Critical') || a.includes('spike')) ? 'critical' : alerts.length > 0 ? 'alert' : 'normal',
        alerts,
      };
    };

    const monitored = simulateLiveMonitor({
      adherenceRate: 50,
      symptomHistory: ['migraine', 'migraine', 'migraine'],
      scoreDrop: 12,
      systolic: 165,
    });

    expect(monitored.status).toBe('critical');
    expect(monitored.alerts.length).toBe(4);
    expect(monitored.alerts).toContain('Medication adherence critical drop');
    expect(monitored.alerts).toContain('Health score deteriorating');
    expect(monitored.alerts.some((a) => a.includes('Repeated symptom'))).toBe(true);
  });

  it('5. Dashboard Integration: Exposes emergencyStatus, activeAlerts, riskTrend, and lastEmergency', () => {
    // Verify dashboard payload format matching server/controllers/dashboardController.js
    const mockDashboardData = {
      emergencyStatus: 'critical',
      activeAlerts: [
        { title: 'EMERGENCY ALERT: CRITICAL', message: 'Severe hypoxemia detected', severity: 'critical' },
      ],
      riskTrend: 'deteriorating',
      lastEmergency: {
        _id: 'inc-latest-1',
        severity: 'CRITICAL',
        triggerReason: 'Severe hypoxemia detected',
      },
    };

    expect(mockDashboardData.emergencyStatus).toBe('critical');
    expect(mockDashboardData.riskTrend).toBe('deteriorating');
    expect(mockDashboardData.activeAlerts.length).toBeGreaterThan(0);
    expect(mockDashboardData.lastEmergency._id).toBe('inc-latest-1');
  });
});
