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

// All AI endpoints protect optional/mandatory user context
router.post('/report/analyze', protect, analyzeReport);
router.post('/report/compare', protect, compareReports);
router.post('/vision/analyze', protect, analyzeVision);
router.get('/health-scores', protect, getHealthScores);
router.get('/predictions', protect, getPredictions);
router.get('/dashboard', protect, getDashboardLogic);
router.get('/search', protect, globalAISearch);
router.get('/wellness-coach', protect, getWellnessCoach);

module.exports = router;
