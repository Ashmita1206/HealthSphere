const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getDashboardAnalytics,
  calculateHealthScore,
  getWeeklySummary,
} = require('../services/analyticsService');

// All analytics routes are protected with JWT authentication
router.use(protect);

/**
 * GET /api/analytics/dashboard
 * Aggregated analytics for the smart health dashboard
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const analytics = await getDashboardAnalytics(userId);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/health-score
 * Multi-factor calculated health score & breakdown
 */
router.get('/health-score', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const scoreData = await calculateHealthScore(userId);
    res.status(200).json({
      success: true,
      data: scoreData,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/weekly-summary
 * 7-day health activity summary
 */
router.get('/weekly-summary', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const weeklyData = await getWeeklySummary(userId);
    res.status(200).json({
      success: true,
      data: weeklyData,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
