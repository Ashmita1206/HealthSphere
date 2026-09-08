const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const {
  getAnalytics,
  getPopulation,
  getRiskMap,
  getSystemHealth,
  getCharts,
} = require('../controllers/adminAnalyticsController');

// Protect all admin routes with JWT
router.use(protect);

// Allow super_admin, admin, doctor, and support roles
router.use(authorizeRoles('super_admin', 'admin', 'doctor', 'support'));

router.get('/analytics', getAnalytics);
router.get('/population', getPopulation);
router.get('/risk-map', getRiskMap);
router.get('/system-health', getSystemHealth);
router.get('/charts', getCharts);

module.exports = router;
