const router = require('express').Router();
const { getHealth, getLiveness, getReadiness, getMetrics } = require('../controllers/systemController');

router.get('/health', getHealth);
router.get('/live', getLiveness);
router.get('/ready', getReadiness);
router.get('/metrics', getMetrics);

module.exports = router;
