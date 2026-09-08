const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createConsultation,
  getConsultations,
  getConsultationById,
  startConsultation,
  endConsultation,
  addDoctorNotes,
  getConsultationMessages,
  sendConsultationMessage,
} = require('../controllers/consultationController');

router.use(protect);

router.post('/', createConsultation);
router.get('/', getConsultations);
router.get('/:id', getConsultationById);
router.put('/:id/start', startConsultation);
router.put('/:id/end', endConsultation);
router.post('/:id/notes', addDoctorNotes);
router.get('/:id/messages', getConsultationMessages);
router.post('/:id/messages', sendConsultationMessage);

module.exports = router;
