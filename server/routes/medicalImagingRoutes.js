const router = require('express').Router();
const {
  uploadScan,
  getScanDetails,
  compareScans,
  getPatientScans,
  verifyScan,
} = require('../controllers/medicalImagingController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/scans', uploadScan);
router.get('/scans/:id', getScanDetails);
router.post('/compare', compareScans);
router.get('/patient/:patientId', getPatientScans);
router.post('/scans/:id/verify', protect, verifyScan);

module.exports = router;
