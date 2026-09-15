const path = require('path');
const router = require('express').Router();
const { getHealth, getLiveness, getReadiness, getMetrics } = require('../controllers/systemController');

router.get('/health', getHealth);
router.get('/live', getLiveness);
router.get('/ready', getReadiness);
router.get('/metrics', getMetrics);
router.get('/swagger.json', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../docs/swagger.json'));
});

module.exports = router;

