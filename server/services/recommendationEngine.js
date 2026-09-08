const { RISK } = require('../utils/constants');

function buildRecommendations({ riskLevel, emergencyDetected }) {
  if (emergencyDetected || riskLevel === RISK.CRITICAL) {
    return [
      'Call emergency services immediately.',
      'Do not delay seeking in-person medical help.',
      'Share your live location with a trusted contact.',
    ];
  }

  if (riskLevel === RISK.HIGH) {
    return [
      'Consult a doctor as soon as possible.',
      'Track symptom progression every few hours.',
      'Avoid strenuous activity until evaluated.',
    ];
  }

  if (riskLevel === RISK.MEDIUM) {
    return [
      'Monitor symptoms over the next 24 hours.',
      'Stay hydrated and get sufficient rest.',
      'Seek medical advice if symptoms worsen.',
    ];
  }

  return [
    'Continue self-monitoring and maintain healthy habits.',
    'Log recurring symptoms for trend analysis.',
    'Book a routine checkup if symptoms persist.',
  ];
}

function buildHealthInsights({ logs = [], reminders = [] }) {
  const insights = [];
  const symptomCounts = new Map();

  for (const log of logs) {
    for (const symptom of log.symptoms || []) {
      const key = symptom.toLowerCase();
      symptomCounts.set(key, (symptomCounts.get(key) || 0) + 1);
    }
  }

  for (const [symptom, count] of symptomCounts.entries()) {
    if (count >= 3) {
      insights.push(`High frequency of ${symptom} detected`);
    }
  }

  const inactiveReminders = reminders.filter(
    (reminder) => reminder.isActive === false,
  ).length;

  if (reminders.length > 0 && inactiveReminders / reminders.length >= 0.4) {
    insights.push('Medication adherence low');
  }

  if (insights.length === 0) {
    insights.push('No significant risk patterns detected');
  }

  return insights;
}

/**
 * Medicine reminders optimization based on user adherence and dosage routines
 */
function optimizeMedicineReminders(context = {}) {
  const recommendations = [];
  const adherence = context?.medications?.adherence;
  const activeList = context?.medications?.activeList || [];

  if (adherence?.rate < 80) {
    recommendations.push('Shift medicine alert notifications 15 minutes earlier to ensure dose readiness.');
    recommendations.push('Group morning and evening medications to reduce schedule fragmentation.');
  }

  const hasMultipleDaily = activeList.filter((m) => /twice|thrice|daily/i.test(m.frequency || '')).length > 2;
  if (hasMultipleDaily) {
    recommendations.push('Utilize smart pill organizers synchronized with HealthSphere notification reminders.');
  }

  if (!recommendations.length) {
    recommendations.push('Current medication reminder schedule is optimal and well-adhered.');
  }

  return recommendations;
}

/**
 * Lifestyle suggestions based on vitals, BMI, and wellness indicators
 */
function generateLifestyleSuggestions(context = {}) {
  const suggestions = [];
  const bmi = context?.profile?.bmi;
  const bp = context?.vitals?.averageBloodPressure;

  if (bmi && (bmi < 18.5 || bmi >= 25)) {
    suggestions.push('Integrate 30 minutes of low-impact cardiovascular movement (e.g. brisk walking) 5 days a week.');
    suggestions.push('Focus on balanced macronutrient intake with emphasis on whole grains and leafy vegetables.');
  } else {
    suggestions.push('Maintain active daily physical movement and routine stretching breaks.');
  }

  if (bp && typeof bp === 'string') {
    const [sys, dia] = bp.split('/').map(Number);
    if (sys >= 130 || dia >= 85) {
      suggestions.push('Adopt dietary DASH principles to support healthy vascular tension.');
      suggestions.push('Practice 10 minutes of slow diaphragmatic breathing daily.');
    }
  }

  suggestions.push('Prioritize 7-8 hours of continuous sleep to support metabolic recovery.');
  return suggestions;
}

/**
 * Risk prevention suggestions tailored to chronic conditions and recent assessments
 */
function generateRiskPreventionSuggestions(context = {}) {
  const suggestions = [];
  const conditions = context?.profile?.chronicConditions || [];
  const recentHighRisk = context?.symptomHistory?.recentHighRiskCount || 0;

  if (conditions.some((c) => /diabet/i.test(c))) {
    suggestions.push('Log fasting and postprandial glucose twice weekly to prevent glycemic spikes.');
  }

  if (conditions.some((c) => /hypertens|heart|cardio/i.test(c))) {
    suggestions.push('Log resting blood pressure twice daily at consistent times.');
  }

  if (recentHighRisk > 0) {
    suggestions.push('Avoid unmonitored high-intensity exertion while symptoms remain unresolved.');
  }

  if (!suggestions.length) {
    suggestions.push('Schedule annual comprehensive preventive biometric screenings.');
    suggestions.push('Stay up to date on seasonal immunizations and routine lab panels.');
  }

  return suggestions;
}

/**
 * Doctor consultation recommendations
 */
function generateDoctorConsultationRecommendations(context = {}) {
  const recommendations = [];
  const recentHighRisk = context?.symptomHistory?.recentHighRiskCount || 0;
  const abnormalReports = context?.clinicalHistory?.recentAbnormalReportsCount || 0;
  const adherence = context?.medications?.adherence;

  if (recentHighRisk > 0) {
    recommendations.push('Schedule an urgent clinical evaluation for recent high-severity symptom triggers.');
  }

  if (abnormalReports > 0) {
    recommendations.push('Share your recent abnormal laboratory reports with your primary care doctor for interpretation.');
  }

  if (adherence?.rate < 65 && (context?.medications?.activeCount || 0) > 0) {
    recommendations.push('Consult your prescribing physician to review medication tolerability and regimen complexity.');
  }

  if (!recommendations.length) {
    recommendations.push('Maintain scheduled periodic wellness consultations with your primary care doctor.');
  }

  return recommendations;
}

/**
 * Generates an end-to-end personalized wellness plan
 */
function generatePersonalizedWellnessPlan(context = {}) {
  return {
    phase: 'Active Health Optimization',
    durationWeeks: 4,
    dailyGoals: {
      waterIntakeLiters: 2.5,
      targetSteps: 8000,
      sleepTargetHours: 7.5,
      medicationAdherenceTarget: 100,
    },
    weeklyMilestones: [
      'Week 1: Establish consistent medication and vital logging routine.',
      'Week 2: Complete 150 minutes of moderate aerobic activity.',
      'Week 3: Review and update biometric health logs and sleep scores.',
      'Week 4: Review health trends and book routine doctor consultation if indicated.',
    ],
  };
}

/**
 * Comprehensive recommendation aggregator for Health Intelligence
 */
function generateComprehensiveRecommendations(context = {}) {
  return {
    medicineReminders: optimizeMedicineReminders(context),
    lifestyle: generateLifestyleSuggestions(context),
    riskPrevention: generateRiskPreventionSuggestions(context),
    doctorConsultation: generateDoctorConsultationRecommendations(context),
    wellnessPlan: generatePersonalizedWellnessPlan(context),
  };
}

module.exports = {
  buildRecommendations,
  buildHealthInsights,
  optimizeMedicineReminders,
  generateLifestyleSuggestions,
  generateRiskPreventionSuggestions,
  generateDoctorConsultationRecommendations,
  generatePersonalizedWellnessPlan,
  generateComprehensiveRecommendations,
};
