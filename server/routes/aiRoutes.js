const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  analyzeReport,
  compareReports,
  analyzeVision,
  getHealthScores,
  getPredictions,
  getDashboardLogic,
  globalAISearch,
  getWellnessCoach,
} = require('../controllers/aiController');
const {
  getPredictiveCareAnalysis,
  getDiseaseProgression,
  getAdherencePrediction,
  getHospitalizationRisk,
  getPersonalizedWellnessPlan,
  getWeeklyReports,
  getWeeklyReportById,
  generateWeeklyReport,
  triggerReanalysis,
} = require('../controllers/predictiveCareController');
const {
  getDigitalTwin,
  rebuildDigitalTwin,
  chatHealthCopilot,
} = require('../controllers/digitalTwinController');

// All AI endpoints protect optional/mandatory user context
router.post('/report/analyze', protect, analyzeReport);
router.post('/report/compare', protect, compareReports);
router.post('/vision/analyze', protect, analyzeVision);
router.get('/health-scores', protect, getHealthScores);
router.get('/predictions', protect, getPredictions);
router.get('/dashboard', protect, getDashboardLogic);
router.get('/search', protect, globalAISearch);
router.get('/wellness-coach', protect, getWellnessCoach);

// F18 — Predictive AI & Personalized Care
router.get('/predictive-care', protect, getPredictiveCareAnalysis);
router.get('/predictive-care/disease-progression', protect, getDiseaseProgression);
router.get('/predictive-care/adherence', protect, getAdherencePrediction);
router.get('/predictive-care/hospitalization-risk', protect, getHospitalizationRisk);
router.get('/predictive-care/wellness-plan', protect, getPersonalizedWellnessPlan);
router.get('/weekly-reports', protect, getWeeklyReports);
router.get('/weekly-reports/:id', protect, getWeeklyReportById);
router.post('/weekly-reports/generate', protect, generateWeeklyReport);
router.post('/predictive-care/reanalyze', protect, triggerReanalysis);
router.post('/reanalyze', protect, triggerReanalysis);

// F19 — AI Digital Twin & Personalized Health Copilot
router.get('/digital-twin', protect, getDigitalTwin);
router.post('/digital-twin/rebuild', protect, rebuildDigitalTwin);
router.post('/health-copilot/chat', protect, chatHealthCopilot);

module.exports = router;
