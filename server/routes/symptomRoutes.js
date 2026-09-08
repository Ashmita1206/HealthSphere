const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  performSymptomCheck,
  getSymptomHistory,
  getSymptomAssessmentById,
} = require('../controllers/symptomController');

router.use(protect);

router.post('/symptom-check', performSymptomCheck);
router.get('/symptom-history', getSymptomHistory);
router.get('/symptom/:id', getSymptomAssessmentById);

module.exports = router;
