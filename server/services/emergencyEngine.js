const logger = require('../utils/logger');

/**
 * Emergency Severity Levels
 */
const EMERGENCY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

/**
 * Evaluates physiological vitals, health score, and symptoms to detect clinical emergencies.
 *
 * Clinical Thresholds:
 * - Oxygen (SpO2): < 90% (CRITICAL), 90-94% (HIGH), >= 95% (NORMAL)
 * - Heart Rate: < 40 or > 140 bpm (CRITICAL), < 50 or > 110 bpm (HIGH), 60-100 (NORMAL)
 * - Blood Pressure: Systolic >= 180 or Diastolic >= 120 (CRITICAL - Hypertensive Crisis),
 *                   Systolic >= 140 or Diastolic >= 90 (HIGH)
 * - Blood Glucose: < 50 or > 350 mg/dL (CRITICAL), < 70 or > 200 mg/dL (HIGH)
 * - Temperature: > 103°F (39.4°C) or < 95°F (35°C) (CRITICAL), > 100.4°F (HIGH)
 * - Symptoms: Emergency keywords (chest pain, shortness of breath, loss of consciousness, stroke signs, anaphylaxis) (CRITICAL)
 * - Health Score: < 40 (HIGH) or < 25 (CRITICAL)
 *
 * @param {Object} metrics
 * @param {number} [metrics.healthScore]
 * @param {Array<string>} [metrics.symptoms]
 * @param {number} [metrics.heartRate]
 * @param {string|number} [metrics.systolic]
 * @param {string|number} [metrics.diastolic]
 * @param {string} [metrics.bloodPressure] - e.g. "185/125"
 * @param {number} [metrics.glucose]
 * @param {number} [metrics.oxygen] - SpO2 percentage e.g. 88
 * @param {number} [metrics.temperature] - in Fahrenheit e.g. 104
 * @returns {{ level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', triggers: Array<string>, isEmergency: boolean, recommendedAction: string }}
 */
function evaluateEmergencyRisk(metrics = {}) {
  const triggers = [];
  let highestLevel = EMERGENCY_LEVELS.LOW;

  function elevate(level, reason) {
    triggers.push(reason);
    const order = [EMERGENCY_LEVELS.LOW, EMERGENCY_LEVELS.MEDIUM, EMERGENCY_LEVELS.HIGH, EMERGENCY_LEVELS.CRITICAL];
    if (order.indexOf(level) > order.indexOf(highestLevel)) {
      highestLevel = level;
    }
  }

  // 1. Oxygen Saturation (SpO2)
  if (typeof metrics.oxygen === 'number') {
    if (metrics.oxygen < 90) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Severe hypoxemia detected (Oxygen: ${metrics.oxygen}%)`);
    } else if (metrics.oxygen < 95) {
      elevate(EMERGENCY_LEVELS.HIGH, `Low oxygen saturation detected (Oxygen: ${metrics.oxygen}%)`);
    }
  }

  // 2. Heart Rate
  if (typeof metrics.heartRate === 'number' && metrics.heartRate > 0) {
    if (metrics.heartRate > 140) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Severe tachycardia detected (Heart Rate: ${metrics.heartRate} bpm)`);
    } else if (metrics.heartRate < 40) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Severe bradycardia detected (Heart Rate: ${metrics.heartRate} bpm)`);
    } else if (metrics.heartRate > 110) {
      elevate(EMERGENCY_LEVELS.HIGH, `Elevated heart rate detected (Heart Rate: ${metrics.heartRate} bpm)`);
    } else if (metrics.heartRate < 50) {
      elevate(EMERGENCY_LEVELS.HIGH, `Low resting heart rate detected (Heart Rate: ${metrics.heartRate} bpm)`);
    }
  }

  // 3. Blood Pressure
  let sys = metrics.systolic;
  let dia = metrics.diastolic;
  if (!sys && metrics.bloodPressure && typeof metrics.bloodPressure === 'string') {
    const parts = metrics.bloodPressure.split('/').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      sys = parts[0];
      dia = parts[1];
    }
  }

  if (typeof sys === 'number' && typeof dia === 'number') {
    if (sys >= 180 || dia >= 120) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Hypertensive crisis detected (BP: ${sys}/${dia} mmHg)`);
    } else if (sys >= 140 || dia >= 90) {
      elevate(EMERGENCY_LEVELS.HIGH, `Stage 2 hypertension detected (BP: ${sys}/${dia} mmHg)`);
    } else if (sys < 90 || dia < 60) {
      elevate(EMERGENCY_LEVELS.HIGH, `Hypotension detected (BP: ${sys}/${dia} mmHg)`);
    }
  }

  // 4. Blood Glucose
  if (typeof metrics.glucose === 'number') {
    if (metrics.glucose < 50) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Severe hypoglycemia detected (Glucose: ${metrics.glucose} mg/dL)`);
    } else if (metrics.glucose > 350) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Severe hyperglycemia / DKA risk detected (Glucose: ${metrics.glucose} mg/dL)`);
    } else if (metrics.glucose < 70) {
      elevate(EMERGENCY_LEVELS.HIGH, `Low blood glucose detected (Glucose: ${metrics.glucose} mg/dL)`);
    } else if (metrics.glucose > 200) {
      elevate(EMERGENCY_LEVELS.HIGH, `Significantly elevated glucose detected (Glucose: ${metrics.glucose} mg/dL)`);
    }
  }

  // 5. Body Temperature
  if (typeof metrics.temperature === 'number') {
    // Treat > 50 as Fahrenheit, <= 50 as Celsius
    const tempF = metrics.temperature > 50 ? metrics.temperature : (metrics.temperature * 9) / 5 + 32;
    if (tempF >= 103) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `High fever hyperpyrexia detected (${tempF.toFixed(1)}°F)`);
    } else if (tempF <= 95) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Hypothermia detected (${tempF.toFixed(1)}°F)`);
    } else if (tempF >= 100.4) {
      elevate(EMERGENCY_LEVELS.MEDIUM, `Febrile temperature recorded (${tempF.toFixed(1)}°F)`);
    }
  }

  // 6. Symptom Assessment
  const symptomList = Array.isArray(metrics.symptoms)
    ? metrics.symptoms
    : typeof metrics.symptoms === 'string'
    ? [metrics.symptoms]
    : [];

  const criticalKeywords = [
    /chest pain|angina|cardiac/i,
    /shortness of breath|difficulty breathing|dyspnea|cannot breathe/i,
    /loss of consciousness|unconscious|fainting|syncope/i,
    /paralysis|slurred speech|facial droop|stroke/i,
    /anaphylaxis|swollen throat|severe allergic/i,
    /profuse bleeding|hemorrhage/i,
    /seizure|convulsion/i,
  ];

  const highKeywords = [
    /severe headache|worst headache/i,
    /palpitations|irregular heartbeat/i,
    /dizziness|vertigo/i,
    /persistent vomiting|severe dehydration/i,
  ];

  for (const sym of symptomList) {
    if (criticalKeywords.some((re) => re.test(sym))) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Acute emergency symptom reported: "${sym}"`);
      break;
    }
  }

  for (const sym of symptomList) {
    if (highestLevel !== EMERGENCY_LEVELS.CRITICAL && highKeywords.some((re) => re.test(sym))) {
      elevate(EMERGENCY_LEVELS.HIGH, `Urgent clinical symptom reported: "${sym}"`);
      break;
    }
  }

  // 7. Overall Health Score
  if (typeof metrics.healthScore === 'number') {
    if (metrics.healthScore < 25) {
      elevate(EMERGENCY_LEVELS.CRITICAL, `Critical composite health score (${metrics.healthScore}/100)`);
    } else if (metrics.healthScore < 45) {
      elevate(EMERGENCY_LEVELS.HIGH, `Low composite health score (${metrics.healthScore}/100)`);
    } else if (metrics.healthScore < 60) {
      elevate(EMERGENCY_LEVELS.MEDIUM, `Borderline health score (${metrics.healthScore}/100)`);
    }
  }

  const isEmergency = highestLevel === EMERGENCY_LEVELS.CRITICAL || highestLevel === EMERGENCY_LEVELS.HIGH;

  let recommendedAction = 'Continue routine health monitoring.';
  if (highestLevel === EMERGENCY_LEVELS.CRITICAL) {
    recommendedAction = 'Call emergency medical services (911/112/108) immediately. Seek immediate emergency room care.';
  } else if (highestLevel === EMERGENCY_LEVELS.HIGH) {
    recommendedAction = 'Seek prompt medical evaluation from a physician or urgent care clinic today.';
  } else if (highestLevel === EMERGENCY_LEVELS.MEDIUM) {
    recommendedAction = 'Schedule a physician consultation and re-check vital signs within 24 hours.';
  }

  return {
    level: highestLevel,
    triggers: triggers.length ? triggers : ['All evaluated biometrics and symptoms are within acceptable ranges'],
    isEmergency,
    recommendedAction,
  };
}

module.exports = {
  evaluateEmergencyRisk,
  EMERGENCY_LEVELS,
};
