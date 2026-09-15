const SymptomAssessment = require('../models/SymptomAssessment');
const MedicalProfile = require('../models/MedicalProfile');
const Medicine = require('../models/Medicine');
const Report = require('../models/Report');
const HealthTimeline = require('../models/HealthTimeline');
const User = require('../models/User');
const { assessSymptoms } = require('../services/clinicalDecisionService');
const timelineService = require('../services/timelineService');
const { createNotification } = require('../services/notificationService');

/**
 * POST /api/ai/symptom-check
 * Run AI clinical decision support triage on submitted symptoms
 */
async function performSymptomCheck(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { symptoms, duration, severity } = req.body;

    if (!symptoms || (Array.isArray(symptoms) && symptoms.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one symptom is required for assessment',
      });
    }

    const symptomsList = Array.isArray(symptoms)
      ? symptoms.map((s) => String(s).trim()).filter(Boolean)
      : String(symptoms)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    // Aggregate user clinical context
    const [profile, medicines, reports, timeline, user] = await Promise.all([
      MedicalProfile.findOne({ userId }).lean(),
      Medicine.find({ userId, isActive: true }).select('name dosage').lean(),
      Report.find({ userId }).select('title riskLevel abnormalValues').limit(5).lean(),
      HealthTimeline.find({ userId }).limit(10).lean(),
      User.findById(userId).select('age gender conditions medicalHistory').lean(),
    ]);

    const existingConditions = [
      ...(profile?.chronicDiseases || []),
      ...(user?.conditions || []),
    ];

    const decision = await assessSymptoms({
      symptoms: symptomsList,
      duration: duration || '',
      severity: severity || 'moderate',
      userProfile: {
        age: user?.age || profile?.dateOfBirth,
        gender: user?.gender || profile?.gender,
        bloodGroup: profile?.bloodGroup,
      },
      medicalHistory: profile?.allergies || user?.medicalHistory || [],
      currentMedicines: medicines,
      healthTimeline: timeline,
      reports,
      existingConditions,
    });

    const assessment = await SymptomAssessment.create({
      userId,
      symptoms: symptomsList,
      duration: duration || '',
      severity: severity || 'moderate',
      aiAssessment: decision,
      riskLevel: decision.riskLevel,
      recommendations: decision.recommendations,
      suggestedSpecialist: decision.suggestedSpecialist,
      requiresDoctor: decision.requiresDoctor,
    });

    // Record health timeline event
    await timelineService.createEvent({
      userId,
      eventType: 'general',
      title: 'AI symptom assessment performed',
      description: `Symptoms analyzed: ${symptomsList.slice(0, 3).join(', ')}. Risk level: ${decision.riskLevel}. Referral: ${decision.suggestedSpecialist}`,
      relatedId: assessment._id,
    });

    // If elevated risk (HIGH or CRITICAL), generate high-risk notification
    if (decision.riskLevel === 'HIGH' || decision.riskLevel === 'CRITICAL' || decision.emergencyDetected) {
      await createNotification({
        userId,
        title: 'High-Risk Symptom Detection',
        message: `Your symptom evaluation indicated elevated risk (${decision.riskLevel}). Consult a ${decision.suggestedSpecialist} or visit urgent care.`,
        type: 'health',
        severity: 'critical',
        priority: 'high',
        route: `/ai/symptom/${assessment._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Symptom assessment completed successfully',
      data: assessment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/symptom-history
 * Retrieve user's symptom assessment history
 */
async function getSymptomHistory(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const history = await SymptomAssessment.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/symptom/:id
 * Retrieve specific assessment by ID with ownership check
 */
async function getSymptomAssessmentById(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const assessment = await SymptomAssessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Symptom assessment not found',
      });
    }

    // IDOR Protection
    if (assessment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot access symptom records of another patient',
      });
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  performSymptomCheck,
  getSymptomHistory,
  getSymptomAssessmentById,
};
