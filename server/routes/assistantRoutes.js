const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  handleChat,
  handleVoice,
  getHistory,
} = require('../controllers/assistantController');

router.use(protect);

router.post('/chat', handleChat);
router.post('/voice', handleVoice);
router.get('/history/:sessionId', getHistory);

module.exports = router;
