const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  connectWearable,
  syncWearableReadings,
  getWearableDevices,
  getWearableReadings,
  disconnectWearable,
} = require('../controllers/wearableController');

router.use(protect);

router.post('/connect', connectWearable);
router.post('/sync', syncWearableReadings);
router.get('/devices', getWearableDevices);
router.get('/readings', getWearableReadings);
router.delete('/devices/:deviceId', disconnectWearable);

module.exports = router;
