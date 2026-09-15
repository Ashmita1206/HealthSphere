import { describe, it, expect } from 'vitest';

// Mirror of clinical decision logic & risk engine for deterministic vitest execution
const emergencyKeywords = [
  'chest pain',
  'unconscious',
  'can not breathe',
  'cannot breathe',
  'difficulty breathing',
  'stroke',
  'seizure',
  'fainted',
  'heart attack',
  'severe bleeding',
];

const MEDICAL_DISCLAIMER =
  'This AI clinical assessment is for informational and triage screening purposes only. It is not a formal medical diagnosis or treatment prescription. If you experience severe chest pain, shortness of breath, loss of consciousness, or other urgent symptoms, contact emergency medical services immediately.';

function assessMockSymptoms({
  symptoms = [] as string[],
  duration = '',
  severity = 'moderate',
  currentMedicines = [] as string[],
  existingConditions = [] as string[],
}) {
  const text = `${symptoms.join(' ')} ${duration} ${severity}`.toLowerCase();

  const isEmergency = emergencyKeywords.some((kw) => text.includes(kw));

  let riskLevel = 'LOW';
  if (isEmergency || severity === 'critical') {
    riskLevel = 'CRITICAL';
  } else if (severity === 'severe' || text.includes('fever') || text.includes('persistent')) {
    riskLevel = 'HIGH';
  } else if (severity === 'moderate') {
    riskLevel = 'MEDIUM';
  }

  let suggestedSpecialist = 'General Physician';
  const possibleConditions: string[] = [];

  if (text.includes('chest pain') || text.includes('palpitations')) {
    suggestedSpecialist = 'Cardiology';
    possibleConditions.push('Angina Pectoris', 'Coronary Artery Disease', 'Arrhythmia');
  } else if (text.includes('cough') || text.includes('breathing')) {
    suggestedSpecialist = 'Pulmonology';
    possibleConditions.push('Bronchial Asthma', 'Upper Respiratory Infection');
  } else if (text.includes('headache') || text.includes('migraine')) {
    suggestedSpecialist = 'Neurology';
    possibleConditions.push('Migraine', 'Tension Headache');
  } else {
    possibleConditions.push('General Viral Syndrome', 'Non-specific Fatigue');
  }

  const recommendations = [
    riskLevel === 'CRITICAL'
      ? 'Seek emergency clinical medical evaluation immediately.'
      : 'Consult a healthcare provider for personalized diagnosis.',
  ];

  if (currentMedicines.length > 0) {
    recommendations.push(`Review active prescriptions (${currentMedicines.join(', ')}) with your doctor.`);
  }

  const requiresDoctor = riskLevel === 'CRITICAL' || riskLevel === 'HIGH' || riskLevel === 'MEDIUM';

  return {
    riskLevel,
    possibleConditions,
    recommendations,
    suggestedSpecialist,
    requiresDoctor,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

describe('F12 AI Symptom Checker & Clinical Decision Support Suite', () => {
  const assessmentDb = new Map<string, { _id: string; userId: string; symptoms: string[]; decision: unknown }>();
  const timelineEvents: Array<{ userId: string; title: string }> = [];
  const notifications: Array<{ userId: string; title: string }> = [];

  const patientA = 'patient-001';
  const patientB = 'patient-002';

  const resetState = () => {
    assessmentDb.clear();
    timelineEvents.length = 0;
    notifications.length = 0;
  };

  function performSymptomCheck(
    callerUserId: string,
    payload: {
      symptoms?: string[];
      duration?: string;
      severity?: string;
      currentMedicines?: string[];
      existingConditions?: string[];
    }
  ) {
    if (!callerUserId) return { status: 401, error: 'Unauthorized' };
    if (!payload.symptoms || payload.symptoms.length === 0) {
      return { status: 400, error: 'At least one symptom is required' };
    }

    const decision = assessMockSymptoms({
      symptoms: payload.symptoms,
      duration: payload.duration,
      severity: payload.severity,
      currentMedicines: payload.currentMedicines,
      existingConditions: payload.existingConditions,
    });

    const assessmentId = `assess-${Date.now()}`;
    assessmentDb.set(assessmentId, {
      _id: assessmentId,
      userId: callerUserId,
      symptoms: payload.symptoms,
      decision,
    });

    // Timeline event
    timelineEvents.push({
      userId: callerUserId,
      title: 'AI symptom assessment performed',
    });

    // Notification on elevated risk
    if (decision.riskLevel === 'HIGH' || decision.riskLevel === 'CRITICAL') {
      notifications.push({
        userId: callerUserId,
        title: 'High-Risk Symptom Detection',
      });
    }

    return { status: 201, data: decision, id: assessmentId };
  }

  function getAssessmentById(callerUserId: string, assessmentId: string) {
    if (!callerUserId) return { status: 401, error: 'Unauthorized' };
    const assessment = assessmentDb.get(assessmentId);
    if (!assessment) return { status: 404, error: 'Assessment not found' };

    // IDOR Check
    if (assessment.userId !== callerUserId) {
      return { status: 403, error: 'Unauthorized: Cannot view another patient assessment' };
    }

    return { status: 200, data: assessment };
  }

  it('1. Validates input: rejects empty symptoms list with 400', () => {
    resetState();
    const res = performSymptomCheck(patientA, { symptoms: [] });
    expect(res.status).toBe(400);
    expect(res.error).toMatch(/symptom is required/i);
  });

  it('2. Evaluates emergency symptoms and flags CRITICAL risk and requiresDoctor', () => {
    resetState();
    const res = performSymptomCheck(patientA, {
      symptoms: ['acute chest pain', 'shortness of breath'],
      severity: 'severe',
      duration: '30 mins',
    });

    expect(res.status).toBe(201);
    expect(res.data?.riskLevel).toBe('CRITICAL');
    expect(res.data?.requiresDoctor).toBe(true);
    expect(res.data?.suggestedSpecialist).toBe('Cardiology');
    expect(res.data?.possibleConditions).toContain('Angina Pectoris');
  });

  it('3. Enforces medical safety rules: mandatory disclaimer and non-final diagnosis', () => {
    const res = performSymptomCheck(patientA, {
      symptoms: ['mild headache', 'fatigue'],
      severity: 'mild',
      duration: '1 day',
    });

    expect(res.status).toBe(201);
    // Medical disclaimer must always be included
    expect(res.data?.disclaimer).toBeDefined();
    expect(res.data?.disclaimer).toContain('informational and triage screening purposes only');
    expect(res.data?.disclaimer).toContain('not a formal medical diagnosis');

    // Conditions must be an array of possibilities, never a single deterministic verdict
    expect(Array.isArray(res.data?.possibleConditions)).toBe(true);
    expect(res.data?.possibleConditions.length).toBeGreaterThan(0);
  });

  it('4. Factors in patient active medications into recommendations', () => {
    const res = performSymptomCheck(patientA, {
      symptoms: ['dizziness', 'lightheadedness'],
      currentMedicines: ['Lisinopril 10mg', 'Hydrochlorothiazide'],
    });

    expect(res.status).toBe(201);
    const medRec = res.data?.recommendations.find((r: string) => r.includes('Lisinopril'));
    expect(medRec).toBeDefined();
  });

  it('5. Triggers Timeline event and High-Risk Notification upon critical symptoms', () => {
    resetState();
    performSymptomCheck(patientA, {
      symptoms: ['cannot breathe', 'severe chest pain'],
      severity: 'critical',
    });

    // Timeline event
    expect(timelineEvents.some((e) => e.title === 'AI symptom assessment performed')).toBe(true);

    // High risk notification
    expect(notifications.some((n) => n.title === 'High-Risk Symptom Detection' && n.userId === patientA)).toBe(true);
  });

  it('6. IDOR Protection: Patient B cannot view Patient A symptom assessment', () => {
    resetState();
    const created = performSymptomCheck(patientA, { symptoms: ['cough', 'fever'] });
    const assessId = created.id!;

    // Patient A can access
    const ownerRes = getAssessmentById(patientA, assessId);
    expect(ownerRes.status).toBe(200);

    // Patient B is blocked
    const intruderRes = getAssessmentById(patientB, assessId);
    expect(intruderRes.status).toBe(403);
    expect(intruderRes.error).toMatch(/Unauthorized/i);
  });
});
