const { computeRiskFromText } = require('./riskEngine');
const { buildRecommendations } = require('./recommendationEngine');
const { analyzeSymptoms } = require('./symptomEngine');

const MEDICAL_DISCLAIMER =
  'This AI clinical assessment is for informational and triage screening purposes only. It is not a formal medical diagnosis or treatment prescription. If you experience severe chest pain, shortness of breath, loss of consciousness, or other urgent symptoms, contact emergency medical services immediately.';

/**
 * Assess symptoms against patient profile, medications, medical history, and clinical safety guidelines.
 */
async function assessSymptoms({
  symptoms = [],
  duration = '',
  severity = 'moderate',
  userProfile = {},
  medicalHistory = [],
  currentMedicines = [],
  healthTimeline = [],
  reports = [],
  existingConditions = [],
}) {
  const symptomsJoined = Array.isArray(symptoms) ? symptoms.join(', ') : String(symptoms);
  const fullText = `${symptomsJoined} ${duration} ${severity} ${existingConditions.join(' ')}`;

  // 1. Evaluate risk using existing riskEngine
  const riskResult = computeRiskFromText(fullText);

  // Escalate risk if severity is severe or critical, or if high-risk existing conditions match
  let riskLevel = (riskResult.riskLevel || 'LOW').toUpperCase();

  if (severity === 'critical' || riskResult.emergencyDetected) {
    riskLevel = 'CRITICAL';
  } else if (severity === 'severe' && riskLevel !== 'CRITICAL') {
    riskLevel = 'HIGH';
  }

  // 2. Specialty and Differential Conditions via symptomEngine
  const { suggestedSpecialist, possibleConditions } = analyzeSymptoms(symptoms);

  // 3. Build clinical recommendations using recommendationEngine
  let recommendations = buildRecommendations({
    riskLevel: riskLevel.toLowerCase(),
    emergencyDetected: riskResult.emergencyDetected,
  });

  // Tailor recommendations with patient context
  if (currentMedicines.length > 0) {
    recommendations.push(
      `Review current medications (${currentMedicines
        .map((m) => (typeof m === 'string' ? m : m.name))
        .filter(Boolean)
        .slice(0, 3)
        .join(', ')}) for potential drug interactions with your doctor.`
    );
  }

  if (existingConditions.length > 0) {
    recommendations.push(
      `Factor in pre-existing conditions: ${existingConditions.slice(0, 2).join(', ')} during evaluation.`
    );
  }

  // 4. Determine if doctor visit is mandatory
  const requiresDoctor =
    riskLevel === 'CRITICAL' ||
    riskLevel === 'HIGH' ||
    riskLevel === 'MEDIUM' ||
    riskResult.requiresDoctor ||
    severity === 'severe' ||
    severity === 'critical';

  return {
    riskLevel,
    possibleConditions,
    recommendations,
    suggestedSpecialist,
    requiresDoctor,
    emergencyDetected: Boolean(riskResult.emergencyDetected),
    disclaimer: MEDICAL_DISCLAIMER,
    clinicalContext: {
      patientAge: userProfile.age || userProfile.dateOfBirth || 'Not specified',
      gender: userProfile.gender || 'Not specified',
      relevantReportsCount: reports.length,
      timelineEventsCount: healthTimeline.length,
    },
  };
}

module.exports = {
  assessSymptoms,
  MEDICAL_DISCLAIMER,
};
