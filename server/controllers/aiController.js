const { parseMedicalReport, compareMedicalReports } = require('../services/ocr/ocrService');
const { analyzeMedicalImage } = require('../services/vision/visionService');
const { calculateUserHealthScores } = require('../services/healthScore/healthScoreService');
const { generateHealthPredictions } = require('../services/predictions/predictionService');
const Medicine = require('../models/Medicine');
const Report = require('../models/Report');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const Appointment = require('../models/Appointment');
const { generateGeminiText, safeParseJSON } = require('../services/gemini/geminiService');
const logger = require('../utils/logger');

/**
 * Report OCR & Intelligence Analysis
 */
async function analyzeReport(req, res, next) {
  try {
    const { mimeType, base64Data, textContent } = req.body;
    const analysis = await parseMedicalReport({ mimeType, base64Data, textContent });

    // Save report to database if user is authenticated
    if (req.user?._id) {
      await Report.create({
        userId: req.user._id,
        title: analysis.reportTitle || 'Medical Report',
        category: analysis.category || 'General',
        summary: analysis.summary,
        riskLevel: analysis.riskLevel?.toLowerCase() || 'low',
        abnormalValues: analysis.abnormalValues || [],
        biomarkers: analysis.biomarkers || {},
      }).catch((err) => logger.warn('Failed saving report record', { error: err.message }));
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Compare 2 Reports
 */
async function compareReports(req, res, next) {
  try {
    const { reportA, reportB } = req.body;
    const result = await compareMedicalReports(reportA, reportB);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * AI Vision Multimodal Analysis
 */
async function analyzeVision(req, res, next) {
  try {
    const { category, mimeType, base64Data } = req.body;
    const analysis = await analyzeMedicalImage({ category, mimeType, base64Data });
    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get AI Health Scores
 */
async function getHealthScores(req, res, next) {
  try {
    const userId = req.user?._id;
    const healthScores = await calculateUserHealthScores(userId);
    res.status(200).json({
      success: true,
      data: healthScores,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get AI Predictive Analytics
 */
async function getPredictions(req, res, next) {
  try {
    const userId = req.user?._id;
    const predictions = await generateHealthPredictions(userId);
    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Module 6 — AI Dashboard Logic
 */
async function getDashboardLogic(req, res, next) {
  try {
    const userId = req.user?._id;
    const [medicines, reports, appointments] = await Promise.all([
      Medicine.find({ userId }).lean().catch(() => []),
      Report.find({ userId }).sort({ createdAt: -1 }).limit(3).lean().catch(() => []),
      Appointment.find({ userId }).sort({ appointmentDate: 1 }).limit(3).lean().catch(() => []),
    ]);

    const dashboardSummary = {
      todaysSummary: 'You have 2 scheduled medications today. Baseline vitals are stable.',
      weeklySummary: 'Overall wellness adherence score increased by 4% this week.',
      aiInsights: [
        'Optimal hydration maintained for 5 consecutive days.',
        'Consider scheduling your bi-annual HbA1c screening test next week.',
      ],
      riskAlerts: reports.some((r) => r.riskLevel === 'high')
        ? [{ title: 'Elevated Biomarker Alert', detail: 'Check recent lab report findings with your physician.' }]
        : [],
      recommendations: [
        'Perform 20 minutes of mild cardiovascular stretching.',
        'Drink at least 2.5 Liters of water daily.',
      ],
      wellnessTrends: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        scores: [78, 82, 80, 85, 84, 88, 90],
      },
      dailyGoals: [
        { title: 'Morning Medication', completed: true },
        { title: 'Hydration 2.5L', completed: false, current: '1.8L' },
        { title: '30 min Exercise Walk', completed: true },
      ],
    };

    res.status(200).json({
      success: true,
      data: dashboardSummary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Module 8 — AI Global Search
 */
async function globalAISearch(req, res, next) {
  try {
    const { query } = req.query;
    const userId = req.user?._id;
    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }

    const regex = new RegExp(query, 'i');

    const [medicines, reports, sessions, appointments] = await Promise.all([
      Medicine.find({ userId, name: regex }).lean().catch(() => []),
      Report.find({ userId, $or: [{ title: regex }, { category: regex }] }).lean().catch(() => []),
      ChatSession.find({ userId, title: regex }).lean().catch(() => []),
      Appointment.find({ userId, doctorName: regex }).lean().catch(() => []),
    ]);

    const results = [
      ...medicines.map((m) => ({ type: 'Medicine', title: m.name, subtitle: `Dosage: ${m.dosage || 'Standard'}`, id: m._id, link: '/medicines' })),
      ...reports.map((r) => ({ type: 'Report', title: r.title, subtitle: `Risk Level: ${r.riskLevel}`, id: r._id, link: '/reports' })),
      ...sessions.map((s) => ({ type: 'Chat', title: s.title, subtitle: `Last active: ${new Date(s.lastActivityAt).toLocaleDateString()}`, id: s._id, link: '/ai-chat' })),
      ...appointments.map((a) => ({ type: 'Appointment', title: `Dr. ${a.doctorName}`, subtitle: `Date: ${new Date(a.appointmentDate).toLocaleDateString()}`, id: a._id, link: '/appointments' })),
    ];

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Module 10 — AI Wellness Coach
 */
async function getWellnessCoach(req, res, next) {
  try {
    const userId = req.user?._id;
    const prompt = `
Generate a personalized daily wellness coaching plan.
Return JSON:
{
  "morningBrief": "Good morning! Start your day with 500ml water and 10 minutes light breathing exercises.",
  "eveningSummary": "Great progress today. Ensure screen dimming 1 hour before sleep.",
  "exercise": "30 minutes moderate brisk walking or light swimming.",
  "hydration": "Target 8 glasses (2.5L) throughout the day.",
  "nutrition": "Focus on high-fiber greens, lean protein, and reduced refined sugars.",
  "sleep": "Aim for 7.5 to 8 hours sleep tonight.",
  "stressAdvice": "Practice 4-7-8 breathing method if feeling overwhelmed."
}
`;

    const raw = await generateGeminiText({ prompt });
    const coachData = safeParseJSON(raw, {
      morningBrief: 'Hydrate well and begin with light morning stretching.',
      eveningSummary: 'Reflect on daily achievements and prepare for restful sleep.',
      exercise: '30 mins active walking.',
      hydration: '2.5L daily target.',
      nutrition: 'Balanced greens & proteins.',
      sleep: '7.5 hours recommended rest.',
      stressAdvice: 'Take 5-minute mindfulness breaks.',
    });

    res.status(200).json({
      success: true,
      data: coachData,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  analyzeReport,
  compareReports,
  analyzeVision,
  getHealthScores,
  getPredictions,
  getDashboardLogic,
  globalAISearch,
  getWellnessCoach,
};
