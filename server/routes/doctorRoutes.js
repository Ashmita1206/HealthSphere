const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createDoctorProfile,
  getMyDoctorProfile,
  updateDoctorProfile,
  getAllDoctors,
  getDoctorById,
} = require('../controllers/doctorController');

// All doctor routes are protected by JWT authentication
router.use(protect);

router.post('/profile', createDoctorProfile);
router.get('/profile', getMyDoctorProfile);
router.put('/profile', updateDoctorProfile);

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

module.exports = router;
