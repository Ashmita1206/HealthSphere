const router = require('express').Router();
const {
  evaluateCase,
  checkInteractions,
  checkContraindications,
  getDifferentialDiagnosis,
  getRiskStratification,
} = require('../controllers/cdssController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/evaluate', protect, evaluateCase);
router.post('/interactions', checkInteractions);
router.post('/contraindications', checkContraindications);
router.post('/differential', getDifferentialDiagnosis);
router.post('/risk-stratification', getRiskStratification);

module.exports = router;
