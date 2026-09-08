const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createShare,
  accessSharedRecords,
  getSharedRecordsList,
  revokeShare,
} = require('../controllers/recordShareController');

// Read-only shared access endpoint is public/token-based
router.get('/share/:token', accessSharedRecords);

// Protected management routes
router.post('/share', protect, createShare);
router.get('/shared', protect, getSharedRecordsList);
router.delete('/share/:id', protect, revokeShare);

module.exports = router;
