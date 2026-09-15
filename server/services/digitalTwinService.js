const mongoose = require('mongoose');
const DigitalTwin = require('../models/DigitalTwin');
const aiContextService = require('./aiContextService');
const timelineService = require('./timelineService');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

/**
 * Compute behavioral patterns from user adherence and telemetry logs
 */
function extractBehaviorPatterns(context) {
  const adherenceRate = context.adherence?.rate ?? 85;
  const medicines = context.medicines || [];
  const vitalsCount = context.vitals?.count || 0;

  let adherenceStability = 'Consistent';
  if (adherenceRate < 65) adherenceStability = 'Volatile';
  else if (adherenceRate < 85) adherenceStability = 'Variable';

  const identifiedHabits = [];
  if (adherenceRate >= 90) {
    identifiedHabits.push('High pharmacotherapy adherence reliability');
  } else {
    identifiedHabits.push('Susceptible to evening or weekend missed dose gaps');
  }

  if (vitalsCount >= 10) {
    identifiedHabits.push('Proactive daily biometric telemetry tracking');
  } else {
    identifiedHabits.push('Infrequent manual vitals telemetry recording');
  }

  if (medicines.length >= 3) {
    identifiedHabits.push('Multi-drug routine coordination required');
  }

  return {
    adherenceStability,
    adherenceScore: adherenceRate,
    activityPattern: vitalsCount >= 14 ? 'Active' : 'Moderate',
    sleepConsistency: 'Regular',
    stressResponse: adherenceRate < 60 ? 'Elevated' : 'Controlled',
    dietaryPattern: 'Balanced',
    loggingFrequency: vitalsCount >= 10 ? 'Daily' : 'Weekly',
    identifiedHabits,
  };
}

/**
 * Extract episodic medical memory from context
 */
function extractMedicalMemory(context) {
  const memory = [];

  // Reports
  (context.reports || []).forEach((report) => {
    memory.push({
      timestamp: report.createdAt || new Date(),
      milestoneType: 'report_anomaly',
      title: report.title || 'Diagnostic Report Analysis',
      summary: report.summary || 'Laboratory parameters analyzed.',
      source: 'diagnostic_lab',
      severity: report.riskLevel === 'high' || report.riskLevel === 'critical' ? 'high' : 'moderate',
    });
  });

  // Known conditions
  (context.medicalProfile?.conditions || []).forEach((c) => {
    memory.push({
      timestamp: c.diagnosedDate || new Date(),
      milestoneType: 'diagnosis',
      title: `Chronic Diagnosis: ${c.name || 'Chronic Condition'}`,
      summary: `Clinically recorded chronic condition with status: ${c.status || 'Active'}`,
      source: 'medical_profile',
      severity: 'moderate',
    });
  });

  // Emergency incidents
  (context.emergencies || []).forEach((em) => {
    memory.push({
      timestamp: em.createdAt || new Date(),
      milestoneType: 'emergency',
      title: `Emergency Incident: ${em.severity || 'HIGH'}`,
      summary: em.triggerReason || 'Acute biometric threshold escalation triggered.',
      source: 'emergency_engine',
      severity: (em.severity || 'high').toLowerCase(),
    });
  });

  // Consultations
  (context.consultations || []).forEach((c) => {
    memory.push({
      timestamp: c.createdAt || new Date(),
      milestoneType: 'treatment_change',
      title: 'Physician Consultation Conducted',
      summary: c.doctorNotes || 'Telemedicine consultation completed.',
      source: 'doctor_consultation',
      severity: 'low',
    });
  });

  return memory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * 1. Build or Rebuild Complete AI Digital Twin
 */
async function buildDigitalTwin(userId, explicitContext = null) {
  try {
    logger.info('Building AI Digital Twin', { userId });
    const context = explicitContext || (await aiContextService.getUserHealthContext(userId));

    const vitals = context.vitals?.latest || {};
    const profile = context.medicalProfile || {};
    const adherence = context.adherence || {};

    // Health profile baseline
    const healthProfile = {
      baselineVitals: {
        systolic: vitals.systolic || 120,
        diastolic: vitals.diastolic || 80,
        heartRate: vitals.heartRate || 72,
        glucose: vitals.glucose || 95,
        oxygen: vitals.oxygen || 98,
        temperature: vitals.temperature || 98.6,
      },
      bloodType: context.user?.bloodType || profile.bloodType || 'Unknown',
      bmi: profile.bmi || 23.5,
      chronicConditions: (profile.conditions || []).map((c) => c.name || c),
      allergies: (profile.allergies || []).map((a) => a.allergen || a),
      geneticRisks: profile.familyHistory || [],
    };

    // Behavior patterns
    const behaviorPatterns = extractBehaviorPatterns(context);

    // Episodic memory
    const medicalMemory = extractMedicalMemory(context);

    // Risk profile calculation
    const sys = healthProfile.baselineVitals.systolic;
    const gluc = healthProfile.baselineVitals.glucose;
    const ox = healthProfile.baselineVitals.oxygen;
    const adh = adherence.rate ?? 85;

    const cardioRisk = sys >= 140 ? 'High' : sys >= 130 ? 'Moderate' : 'Low';
    const metabRisk = gluc >= 160 ? 'High' : gluc >= 125 ? 'Moderate' : 'Low';
    const respRisk = ox < 93 ? 'High' : ox < 95 ? 'Moderate' : 'Low';
    const hospRisk = (cardioRisk === 'High' || metabRisk === 'High' || respRisk === 'High' || adh < 60)
      ? 'HIGH'
      : (cardioRisk === 'Moderate' || metabRisk === 'Moderate' || adh < 80)
      ? 'MODERATE'
      : 'LOW';

    const activeWarnings = [];
    if (cardioRisk === 'High') activeWarnings.push(`Systolic blood pressure baseline elevated (${sys} mmHg)`);
    if (metabRisk === 'High') activeWarnings.push(`Blood glucose baseline elevated (${gluc} mg/dL)`);
    if (respRisk === 'High') activeWarnings.push(`Capillary oxygen saturation sub-optimal (${ox}%)`);
    if (adh < 65) activeWarnings.push(`Medication adherence below clinical safety margin (${adh}%)`);

    const riskProfile = {
      cardiovascularRisk: cardioRisk,
      metabolicRisk: metabRisk,
      respiratoryRisk: respRisk,
      hospitalizationRisk: hospRisk,
      acuteVulnerabilityIndex: Math.min(95, Math.max(5, (sys > 140 ? 30 : 10) + (gluc > 140 ? 30 : 10) + (100 - adh) * 0.3)),
      activeWarnings,
    };

    // Forward prediction history
    const predictionHistory = [
      {
        predictedAt: new Date(),
        eventType: 'Metabolic & Cardiovascular Equilibrium',
        horizon: '30_days',
        probability: hospRisk === 'LOW' ? 12 : hospRisk === 'MODERATE' ? 38 : 72,
        preventiveAction: cardioRisk === 'High' ? 'Adopt DASH sodium restriction <1,800mg/day' : 'Maintain consistent aerobic zone-2 cardio',
        actualOutcome: 'tracking',
      },
    ];

    // Compute composite confidence score
    let dataPoints = (medicalMemory.length * 5) + ((context.vitals?.count || 0) * 3) + ((context.medicines?.length || 0) * 4);
    const confidenceScore = Math.max(68, Math.min(98, 55 + Math.round(dataPoints * 0.4)));

    // Narrative Summary
    const narrativeSummary = `Digital Twin synchronized for patient. Composite baseline vitals indicate ${cardioRisk.toLowerCase()} cardiovascular risk, ${metabRisk.toLowerCase()} metabolic risk, and ${adherence.status || 'stable adherence'}. ${medicalMemory.length} historical medical milestones indexed.`;

    const twinData = {
      userId,
      healthProfile,
      medicalMemory,
      behaviorPatterns,
      riskProfile,
      predictionHistory,
      lastAnalysis: {
        timestamp: new Date(),
        narrativeSummary,
        primaryDrivers: activeWarnings.length ? activeWarnings : ['Homeostasis maintained across core organ systems'],
        keyShifts: activeWarnings.length ? ['Elevated baseline risk factors detected'] : ['Stable physiological baseline'],
      },
      confidenceScore,
    };

    let twin = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        twin = await DigitalTwin.findOneAndUpdate(
          { userId },
          { $set: twinData },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (_dbErr) {
        twin = { ...twinData, _id: 'twin-mock-id' };
      }
    } else {
      twin = { ...twinData, _id: 'twin-mock-id' };
    }

    // Timeline event
    await timelineService.createEvent({
      userId,
      eventType: 'general',
      category: 'general',
      title: 'DIGITAL_TWIN_UPDATED',
      description: `AI Digital Twin calibrated with ${confidenceScore}% confidence. Risk tier: ${riskProfile.hospitalizationRisk}.`,
    });

    // Notify if new pattern detected
    if (activeWarnings.length > 0) {
      await notificationService.createNotification({
        userId,
        title: 'Digital Twin Pattern Alert',
        message: `Your AI Digital Twin identified a new health pattern: ${activeWarnings[0]}.`,
        type: 'health',
        priority: 'high',
        route: '/digital-twin',
      });
    }

    return twin;
  } catch (err) {
    logger.error('Failed to build digital twin', { userId, error: err.message });
    throw err;
  }
}

/**
 * Safe helper to find or build digital twin without hanging on disconnected Mongoose
 */
async function findTwinSafe(userId, explicitTwin = null) {
  if (explicitTwin) return explicitTwin;
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const found = await DigitalTwin.findOne({ userId });
      if (found) return found;
    } catch (_err) {
      // fallback
    }
  }
  return await buildDigitalTwin(userId);
}

/**
 * 2. Incremental Digital Twin Update
 */
async function updateTwin(userId, deltaData = {}) {
  try {
    let twin = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        twin = await DigitalTwin.findOne({ userId });
      } catch (_err) {
        twin = null;
      }
    }
    if (!twin) {
      twin = await buildDigitalTwin(userId);
    }

    if (deltaData.healthProfile) {
      twin.healthProfile = { ...(twin.healthProfile?.toObject ? twin.healthProfile.toObject() : twin.healthProfile), ...deltaData.healthProfile };
    }
    if (deltaData.behaviorPatterns) {
      twin.behaviorPatterns = { ...(twin.behaviorPatterns?.toObject ? twin.behaviorPatterns.toObject() : twin.behaviorPatterns), ...deltaData.behaviorPatterns };
    }
    if (deltaData.riskProfile) {
      twin.riskProfile = { ...(twin.riskProfile?.toObject ? twin.riskProfile.toObject() : twin.riskProfile), ...deltaData.riskProfile };
    }
    if (Array.isArray(deltaData.newMemories)) {
      twin.medicalMemory = twin.medicalMemory || [];
      twin.medicalMemory.unshift(...deltaData.newMemories);
    }

    if (twin.lastAnalysis) {
      twin.lastAnalysis.timestamp = new Date();
    }
    if (typeof twin.save === 'function' && mongoose.connection?.readyState === 1) {
      await twin.save();
    }

    await timelineService.createEvent({
      userId,
      eventType: 'general',
      category: 'general',
      title: 'DIGITAL_TWIN_UPDATED',
      description: 'Incremental telemetry update synchronized to AI Digital Twin.',
    });

    return twin;
  } catch (err) {
    logger.error('Failed to update twin', { userId, error: err.message });
    throw err;
  }
}

/**
 * 3. Generate Longitudinal Health Narrative
 */
async function generateHealthNarrative(userId, explicitTwin = null) {
  const twin = await findTwinSafe(userId, explicitTwin);

  const vitals = twin.healthProfile?.baselineVitals || {};
  const conditions = twin.healthProfile?.chronicConditions || [];
  const risk = twin.riskProfile || {};
  const habits = twin.behaviorPatterns?.identifiedHabits || [];
  const memory = twin.medicalMemory || [];

  const narrative = [
    `Patient Health Profile Overview: Baseline blood pressure is established at ${vitals.systolic}/${vitals.diastolic} mmHg with an average resting heart rate of ${vitals.heartRate} bpm.`,
    conditions.length
      ? `Chronic clinical conditions under active management: ${conditions.join(', ')}.`
      : `No persistent chronic diseases identified in baseline profile.`,
    `Long-term behavior analysis indicates adherence stability is classified as ${twin.behaviorPatterns?.adherenceStability || 'Consistent'} (${twin.behaviorPatterns?.adherenceScore || 85}% adherence index).`,
    `Current clinical risk stratification: Cardiovascular risk is ${risk.cardiovascularRisk || 'Low'}, Metabolic risk is ${risk.metabolicRisk || 'Low'}, and overall acute hospitalization vulnerability is rated ${risk.hospitalizationRisk || 'LOW'}.`,
    memory.length
      ? `Longitudinal episodic memory preserves ${memory.length} clinical records spanning diagnostic lab analyses, prescription changes, and clinical consultations.`
      : `Episodic medical memory currently awaiting additional clinical lab uploads.`,
  ].join(' ');

  return {
    userId,
    generatedAt: new Date().toISOString(),
    narrative,
    confidenceScore: twin.confidenceScore || 88,
    keyShifts: twin.lastAnalysis?.keyShifts || [],
    habits,
  };
}

/**
 * 4. Predict Next Prospective Health Event
 */
async function predictNextHealthEvent(userId, explicitTwin = null) {
  const twin = await findTwinSafe(userId, explicitTwin);

  const risk = twin.riskProfile || {};
  const vitals = twin.healthProfile?.baselineVitals || {};
  const adherence = twin.behaviorPatterns?.adherenceScore || 85;

  let eventType = 'Routine Preventive Milestone';
  let horizon = '30-45 days';
  let probability = 15;
  let rationale = 'Physiological telemetry is stable across major organ systems.';
  let recommendedIntervention = 'Schedule routine preventive dental and annual metabolic blood work.';

  if (risk.cardiovascularRisk === 'High' || vitals.systolic >= 140) {
    eventType = 'Cardiovascular Blood Pressure Excursion';
    horizon = '14-21 days';
    probability = 68;
    rationale = `Elevated baseline systolic pressure (${vitals.systolic} mmHg) increases probability of sustained Stage-2 hypertension.`;
    recommendedIntervention = 'Log daily morning BP and initiate dietary sodium reduction below 1,800mg/day.';
  } else if (adherence < 65) {
    eventType = 'Medication Adherence Drop / Prescription Lapse';
    horizon = '7-10 days';
    probability = 75;
    rationale = `Recent compliance rate is suppressed at ${adherence}%, indicating impending prescription depletion or omission pattern.`;
    recommendedIntervention = 'Enable smart push reminders with audible alerts and pill-box consolidation.';
  } else if (risk.metabolicRisk === 'High' || vitals.glucose > 140) {
    eventType = 'Post-Prandial Glycemic Elevation';
    horizon = '7-14 days';
    probability = 62;
    rationale = `Fasting glucose elevated at ${vitals.glucose} mg/dL, predicting heightened glycemic variability.`;
    recommendedIntervention = 'Adopt low-glycemic index food selections and post-meal 15-minute walks.';
  }

  return {
    userId,
    predictedAt: new Date().toISOString(),
    nextEvent: {
      eventType,
      horizon,
      probability,
      rationale,
      recommendedIntervention,
    },
    confidenceScore: twin.confidenceScore || 88,
  };
}

/**
 * 5. Conversational Health Copilot (Q&A using Complete Health History)
 */
async function chatWithHealthCopilot(userId, userMessage, explicitTwin = null) {
  if (!userMessage || !String(userMessage).trim()) {
    throw new Error('User message is required for Health Copilot chat');
  }

  const twin = await findTwinSafe(userId, explicitTwin);

  const query = userMessage.toLowerCase();
  const vitals = twin.healthProfile?.baselineVitals || {};
  const risk = twin.riskProfile || {};
  const adherence = twin.behaviorPatterns?.adherenceScore ?? 85;
  const memory = twin.medicalMemory || [];
  const warnings = risk.activeWarnings || [];

  let responseText = '';
  let sourceContext = [];

  if (query.includes('why') && (query.includes('health score') || query.includes('dropping') || query.includes('decreased'))) {
    const reasons = [];
    if (adherence < 75) reasons.push(`Medication adherence has dropped to ${adherence}%`);
    if (vitals.systolic >= 135) reasons.push(`Blood pressure readings elevated to ${vitals.systolic}/${vitals.diastolic} mmHg`);
    if (vitals.glucose > 125) reasons.push(`Blood sugar readings increased to ${vitals.glucose} mg/dL`);
    if (warnings.length > 0) reasons.push(...warnings);

    responseText = reasons.length
      ? `Based on your complete Digital Twin telemetry, your health score has been impacted by: ${reasons.join(', ')}. Taking your prescribed doses on time and lowering sodium intake will promptly help restore your score.`
      : `Your Digital Twin telemetry shows your vital signs are currently stable. Any slight score fluctuations may be linked to irregular sleep or temporary stress.`;
    sourceContext = ['digital_twin.riskProfile', 'digital_twin.behaviorPatterns'];
  } else if (query.includes('what changed') || query.includes('this month') || query.includes('recent')) {
    const shifts = twin.lastAnalysis?.keyShifts || [];
    responseText = `Summary of recent changes in your Digital Twin: Average systolic BP is ${vitals.systolic} mmHg, blood glucose is ${vitals.glucose} mg/dL, and medication adherence is tracking at ${adherence}%. ${shifts.join('. ')}`;
    sourceContext = ['digital_twin.lastAnalysis', 'digital_twin.healthProfile'];
  } else if (query.includes('improve') || query.includes('recommend') || query.includes('what should i do')) {
    const actionList = [];
    if (vitals.systolic > 130) actionList.push('Adopt the DASH cardioprotective diet with daily sodium <1,800mg');
    if (adherence < 85) actionList.push('Set automated evening reminder alarms for scheduled medications');
    if (vitals.heartRate > 80) actionList.push('Incorporate 150 minutes of weekly aerobic zone-2 cardio');
    if (!actionList.length) actionList.push('Maintain your current optimal hydration (2.5L/day) and consistent 7.5-8 hour sleep schedule');

    responseText = `Here are the highest-impact clinical recommendations from your Digital Twin: ${actionList.map((a, i) => `${i + 1}. ${a}`).join(' ')}`;
    sourceContext = ['digital_twin.behaviorPatterns', 'digital_twin.riskProfile'];
  } else {
    // General longitudinal copilot response
    responseText = `Hello! I am your HealthSphere AI Health Copilot. Looking at your complete health history, your current vitals indicate ${vitals.systolic}/${vitals.diastolic} mmHg BP, ${vitals.glucose} mg/dL blood glucose, ${vitals.oxygen}% SpO2, and ${adherence}% medication adherence. How can I assist you with your health goals today?`;
    sourceContext = ['digital_twin.healthProfile'];
  }

  return {
    reply: responseText,
    sourceContext,
    confidenceScore: twin.confidenceScore || 88,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  buildDigitalTwin,
  updateTwin,
  generateHealthNarrative,
  predictNextHealthEvent,
  chatWithHealthCopilot,
};
