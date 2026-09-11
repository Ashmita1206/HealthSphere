const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');
const c = require('../controllers/monitoringController');

// Diagnostic endpoints requiring authentication
router.get('/diagnostics', protect, c.getDiagnostics);
router.get('/crashes', protect, c.getCrashLogs);

module.exports = router;
