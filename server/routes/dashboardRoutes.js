const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

router.use(protect);
router.get('/', getDashboard);

module.exports = router;
