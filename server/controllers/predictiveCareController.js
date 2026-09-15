const { getUserHealthContext } = require('../services/aiContextService');
const predictiveCareService = require('../services/predictiveCareService');
const WeeklyHealthReport = require('../models/WeeklyHealthReport');

/**
 * GET /api/ai/predictive-care
 * Consolidated predictive healthcare intelligence suite
 */
async function getPredictiveCareAnalysis(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const context = await getUserHealthContext(userId);

    const [diseaseProgression, medicationAdherence, hospitalizationRisk, personalizedWellness] =
      await Promise.all([
        predictiveCareService.predictDiseaseProgression(context),
        predictiveCareService.predictMedicationAdherence(context),
        predictiveCareService.predictHospitalizationRisk(context),
        predictiveCareService.generatePersonalizedWellnessPlan(context),
      ]);

    res.status(200).json({
      success: true,
      data: {
        userId,
        timestamp: new Date().toISOString(),
        diseaseProgression,
        medicationAdherence,
        hospitalizationRisk,
        personalizedWellness: personalizedWellness.wellnessPlan,
        aiConfidence: personalizedWellness.aiConfidence,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/predictive-care/disease-progression
 */
async function getDiseaseProgression(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const context = await getUserHealthContext(userId);
    const data = await predictiveCareService.predictDiseaseProgression(context);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/predictive-care/adherence
 */
async function getAdherencePrediction(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const context = await getUserHealthContext(userId);
    const data = await predictiveCareService.predictMedicationAdherence(context);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/predictive-care/hospitalization-risk
 */
async function getHospitalizationRisk(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const context = await getUserHealthContext(userId);
    const data = await predictiveCareService.predictHospitalizationRisk(context);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/predictive-care/wellness-plan
 */
async function getPersonalizedWellnessPlan(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const context = await getUserHealthContext(userId);
    const data = await predictiveCareService.generatePersonalizedWellnessPlan(context);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/weekly-reports
 * Retrieve historical weekly AI health reports
 */
async function getWeeklyReports(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const reports = await WeeklyHealthReport.find({ userId })
      .sort({ weekStartDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/weekly-reports/:id
 * Retrieve specific weekly health report with IDOR protection
 */
async function getWeeklyReportById(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const report = await WeeklyHealthReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Weekly health report not found',
      });
    }

    if (report.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Access forbidden',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/weekly-reports/generate
 * On-demand or scheduled trigger to generate a new weekly health report
 */
async function generateWeeklyReport(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const report = await predictiveCareService.generateWeeklyHealthReport(userId);

    res.status(201).json({
      success: true,
      message: 'Weekly AI health report generated successfully',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/predictive-care/reanalyze
 * Trigger scheduled or on-demand AI re-analysis job
 */
async function triggerReanalysis(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await predictiveCareService.runScheduledAiReanalysis(userId);

    res.status(200).json({
      success: true,
      message: 'Predictive health intelligence re-analysis executed successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPredictiveCareAnalysis,
  getDiseaseProgression,
  getAdherencePrediction,
  getHospitalizationRisk,
  getPersonalizedWellnessPlan,
  getWeeklyReports,
  getWeeklyReportById,
  generateWeeklyReport,
  triggerReanalysis,
};
