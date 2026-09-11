const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');
const c = require('../controllers/performanceController');

// All performance metrics require authentication
router.use(protect);

router.get('/metrics', c.getPerformanceMetrics);
router.post('/cache/purge', c.purgeCache);
router.post('/jobs/trigger', c.triggerJob);

module.exports = router;
