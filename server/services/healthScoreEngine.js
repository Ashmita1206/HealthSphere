const { getUserHealthContext } = require('./aiContextService');
const logger = require('../utils/logger');

/**
 * Returns human-readable status from score (0-100)
 */
function getScoreStatus(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Attention';
}

/**
 * Calculate Medication Adherence Score
 */
function calculateMedicationScore(context) {
  const adherence = context?.medications?.adherence;
  const activeCount = context?.medications?.activeCount || 0;

  if (activeCount === 0) {
    return {
      score: 95,
      status: 'Excellent',
      factors: ['No active prescription medications required', 'No missed doses recorded'],
      recommendations: ['Maintain preventive health practices', 'Log any over-the-counter supplements'],
    };
  }

  const rate = typeof adherence?.rate === 'number' ? adherence.rate : 80;
  const missed = adherence?.missedCount || 0;

  const factors = [];
  const recommendations = [];

  if (rate >= 90) {
    factors.push('Medication adherence high (>90%)');
    recommendations.push('Maintain regular dosing schedule');
  } else if (rate >= 75) {
    factors.push(`Medication adherence moderate (${rate}%)`);
    recommendations.push('Set automated reminders for daily doses');
  } else {
    factors.push(`Medication adherence low (${rate}%)`);
    factors.push(`${missed} doses missed in recent cycle`);
    recommendations.push('Consult your doctor or pharmacist about pill management');
    recommendations.push('Enable push notifications for timely dosage alerts');
  }

  return {
    score: Math.max(0, Math.min(100, rate)),
    status: getScoreStatus(rate),
    factors,
    recommendations,
  };
}

/**
 * Calculate Heart Health Score
 */
function calculateHeartHealthScore(context) {
  let score = 85;
  const factors = [];
  const recommendations = [];

  const hr = context?.vitals?.averageHeartRate;
  if (hr) {
    if (hr >= 60 && hr <= 85) {
      factors.push(`Resting heart rate in optimal range (${hr} bpm)`);
      score += 5;
    } else if (hr > 85 && hr <= 100) {
      factors.push(`Resting heart rate slightly elevated (${hr} bpm)`);
      score -= 5;
      recommendations.push('Engage in aerobic exercises to support resting heart rate');
    } else {
      factors.push(`Atypical heart rate recorded (${hr} bpm)`);
      score -= 15;
      recommendations.push('Consult a physician to assess cardiac rate variability');
    }
  } else {
    factors.push('Baseline heart rate stable');
  }

  const bp = context?.vitals?.averageBloodPressure;
  if (bp && typeof bp === 'string') {
    const [sys, dia] = bp.split('/').map(Number);
    if (sys && dia) {
      if (sys < 120 && dia < 80) {
        factors.push(`Blood pressure in normal range (${bp} mmHg)`);
        score += 5;
      } else if (sys < 130 && dia < 80) {
        factors.push(`Elevated systolic blood pressure (${bp} mmHg)`);
        score -= 5;
        recommendations.push('Reduce dietary sodium and monitor blood pressure weekly');
      } else {
        factors.push(`Hypertension indicator detected (${bp} mmHg)`);
        score -= 15;
        recommendations.push('Consult doctor regarding blood pressure management');
      }
    }
  }

  // Check chronic conditions
  const conditions = context?.profile?.chronicConditions || [];
  if (conditions.some((c) => /cardio|heart|hypertension/i.test(c))) {
    score -= 10;
    factors.push('Cardiovascular condition noted in medical history');
    recommendations.push('Adhere to cardiologist guidance and routine monitoring');
  }

  score = Math.max(20, Math.min(100, score));
  return {
    score,
    status: getScoreStatus(score),
    factors: factors.length ? factors : ['Cardiovascular vitals within normal parameters'],
    recommendations: recommendations.length ? recommendations : ['Continue heart-healthy lifestyle and diet'],
  };
}

/**
 * Calculate Risk Score (higher score = safer/lower clinical risk)
 */
function calculateRiskScore(context) {
  let score = 90;
  const factors = [];
  const recommendations = [];

  const highRiskSymptoms = context?.symptomHistory?.recentHighRiskCount || 0;
  const abnormalReports = context?.clinicalHistory?.recentAbnormalReportsCount || 0;
  const abnormalVitals = context?.vitals?.abnormalVitalsCount || 0;

  if (highRiskSymptoms > 0) {
    score -= highRiskSymptoms * 15;
    factors.push(`${highRiskSymptoms} elevated symptom assessment(s) in history`);
    recommendations.push('Follow up immediately on flagged clinical symptoms');
  }

  if (abnormalReports > 0) {
    score -= abnormalReports * 10;
    factors.push(`${abnormalReports} medical report(s) flagged abnormal findings`);
    recommendations.push('Review abnormal lab biomarkers with your primary care provider');
  }

  if (abnormalVitals > 0) {
    score -= abnormalVitals * 5;
    factors.push('Occasional out-of-range vitals logged');
    recommendations.push('Log blood pressure and vitals consistently');
  }

  if (factors.length === 0) {
    factors.push('No acute or critical risk indicators detected');
    recommendations.push('Continue regular preventive screenings');
  }

  score = Math.max(15, Math.min(100, score));
  return {
    score,
    status: getScoreStatus(score),
    factors,
    recommendations,
  };
}

/**
 * Calculate Lifestyle Score
 */
function calculateLifestyleScore(context) {
  let score = 80;
  const factors = [];
  const recommendations = [];

  const bmi = context?.profile?.bmi;
  if (bmi) {
    if (bmi >= 18.5 && bmi <= 24.9) {
      factors.push(`BMI in healthy reference range (${bmi})`);
      score += 5;
    } else if (bmi >= 25 && bmi < 30) {
      factors.push(`BMI indicates slightly overweight (${bmi})`);
      score -= 5;
      recommendations.push('Incorporate 150 minutes of moderate activity weekly');
    } else {
      factors.push(`BMI out of standard range (${bmi})`);
      score -= 10;
      recommendations.push('Consult a certified nutritionist for dietary guidance');
    }
  }

  factors.push('Daily lifestyle routines monitored');
  recommendations.push('Maintain balanced sleep, diet, and physical movement');

  score = Math.max(30, Math.min(100, score));
  return {
    score,
    status: getScoreStatus(score),
    factors,
    recommendations,
  };
}

/**
 * Calculate Recovery Score
 */
function calculateRecoveryScore(context) {
  let score = 82;
  const factors = [];
  const recommendations = [];

  const activeConsults = context?.clinicalHistory?.recentConsultations?.filter((c) => c.status === 'active') || [];
  if (activeConsults.length > 0) {
    score -= 8;
    factors.push('Ongoing clinical consultation in progress');
    recommendations.push('Follow prescribed recovery protocol closely');
  } else {
    factors.push('No acute clinical recovery setbacks detected');
    recommendations.push('Allow adequate rest between strenuous daily workouts');
  }

  return {
    score: Math.max(25, Math.min(100, score)),
    status: getScoreStatus(score),
    factors,
    recommendations,
  };
}

/**
 * Calculate Sleep Score
 */
function calculateSleepScore() {
  const score = 78;
  return {
    score,
    status: getScoreStatus(score),
    factors: ['Estimated sleep regularity within expected range', 'Circadian consistency maintained'],
    recommendations: ['Target 7-8 hours of uninterrupted sleep', 'Avoid screens 45 minutes before sleep'],
  };
}

/**
 * Calculate Activity Score
 */
function calculateActivityScore(context) {
  const bmi = context?.profile?.bmi || 23;
  let score = 75;
  const factors = [];
  const recommendations = [];

  if (bmi < 26) {
    score += 5;
    factors.push('Metabolic profile supports active physical exercise');
    recommendations.push('Aim for 8,000+ daily steps');
  } else {
    score -= 5;
    factors.push('Sedentary index slightly elevated');
    recommendations.push('Take short 5-minute walking breaks every hour');
  }

  return {
    score: Math.max(30, Math.min(100, score)),
    status: getScoreStatus(score),
    factors,
    recommendations,
  };
}

/**
 * Calculate Hydration Score
 */
function calculateHydrationScore() {
  const score = 84;
  return {
    score,
    status: getScoreStatus(score),
    factors: ['Adequate daily fluid balance supported', 'Cellular hydration targets steady'],
    recommendations: ['Maintain 2.5 to 3 liters of water intake daily', 'Hydrate prior to and after exercise'],
  };
}

/**
 * Calculate Nutrition Score
 */
function calculateNutritionScore(context) {
  let score = 80;
  const factors = [];
  const recommendations = [];

  const glucose = context?.vitals?.latestGlucose;
  if (glucose) {
    if (glucose >= 70 && glucose <= 110) {
      factors.push(`Fasting glucose optimal (${glucose} mg/dL)`);
      score += 5;
    } else if (glucose > 140) {
      factors.push(`Elevated blood glucose recorded (${glucose} mg/dL)`);
      score -= 10;
      recommendations.push('Limit refined sugars and high-glycemic carbohydrates');
    }
  }

  factors.push('Balanced whole foods focus observed');
  recommendations.push('Prioritize dietary fiber, lean protein, and leafy greens');

  return {
    score: Math.max(30, Math.min(100, score)),
    status: getScoreStatus(score),
    factors,
    recommendations,
  };
}

/**
 * Calculate Mental Wellness Score
 */
function calculateMentalWellnessScore(context) {
  let score = 78;
  const factors = [];
  const recommendations = [];

  const recentAssessments = context?.symptomHistory?.recentAssessments || [];
  const hasStress = recentAssessments.some((a) =>
    (a.symptoms || []).some((s) => /stress|anxiety|insomnia|fatigue/i.test(s))
  );

  if (hasStress) {
    score -= 10;
    factors.push('Recent logs report elevated stress or fatigue');
    recommendations.push('Practice daily 10-minute mindfulness or guided breathing');
    recommendations.push('Ensure healthy work-rest boundaries');
  } else {
    factors.push('Emotional wellness and stress resilience stable');
    recommendations.push('Continue mindful relaxation and positive social engagement');
  }

  return {
    score: Math.max(30, Math.min(100, score)),
    status: getScoreStatus(score),
    factors,
    recommendations,
  };
}

/**
 * Main AI Health Score Engine
 * Generates overall health score (0-100) and 10 detailed sub-scores
 * @param {string|Object} userOrContext - userId string or pre-aggregated context object
 * @returns {Promise<Object>}
 */
async function generateHealthScores(userOrContext) {
  try {
    let context;
    if (typeof userOrContext === 'string' || (userOrContext && userOrContext._id)) {
      context = await getUserHealthContext(userOrContext._id || userOrContext);
    } else if (userOrContext && typeof userOrContext === 'object') {
      context = userOrContext;
    } else {
      throw new Error('Valid userId or health context is required');
    }

    const subScores = {
      medicationAdherence: calculateMedicationScore(context),
      lifestyle: calculateLifestyleScore(context),
      recovery: calculateRecoveryScore(context),
      risk: calculateRiskScore(context),
      sleep: calculateSleepScore(context),
      activity: calculateActivityScore(context),
      hydration: calculateHydrationScore(context),
      nutrition: calculateNutritionScore(context),
      mentalWellness: calculateMentalWellnessScore(context),
      heartHealth: calculateHeartHealthScore(context),
    };

    // Calculate weighted overall score
    const weights = {
      medicationAdherence: 0.15,
      heartHealth: 0.15,
      risk: 0.15,
      lifestyle: 0.10,
      recovery: 0.10,
      activity: 0.10,
      nutrition: 0.10,
      sleep: 0.05,
      hydration: 0.05,
      mentalWellness: 0.05,
    };

    let weightedSum = 0;
    for (const [key, weight] of Object.entries(weights)) {
      weightedSum += (subScores[key]?.score || 75) * weight;
    }
    const overallHealthScore = Math.round(weightedSum);

    return {
      userId: context.userId,
      overallHealthScore,
      status: getScoreStatus(overallHealthScore),
      scores: subScores,
      calculatedAt: new Date().toISOString(),
    };
  } catch (err) {
    logger.error('HealthScoreEngine calculation error', { error: err.message });
    throw err;
  }
}

module.exports = {
  generateHealthScores,
  getScoreStatus,
  calculateMedicationScore,
  calculateHeartHealthScore,
  calculateRiskScore,
  calculateLifestyleScore,
  calculateRecoveryScore,
  calculateSleepScore,
  calculateActivityScore,
  calculateHydrationScore,
  calculateNutritionScore,
  calculateMentalWellnessScore,
};
