const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');
const c = require('../controllers/offlineSyncController');

// All offline sync endpoints require authentication
router.use(protect);

router.get('/bootstrap', c.getBootstrapSnapshot);
router.post('/batch', c.batchReplayMutations);

module.exports = router;
