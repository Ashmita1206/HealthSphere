const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getSessions,
  createSession,
  renameSession,
  deleteSession,
  searchChats,
  getMessages,
  sendMessage,
  feedbackMessage,
} = require('../controllers/chatController');

router.use(protect);

// Sessions
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.put('/sessions/:sessionId', renameSession);
router.put('/sessions/:id', renameSession);
router.delete('/sessions/:sessionId', deleteSession);
router.delete('/sessions/:id', deleteSession);
router.get('/search', searchChats);

// Messages
router.get('/sessions/:sessionId/messages', getMessages);
router.get('/sessions/:id/messages', getMessages);
router.post('/sessions/:sessionId/messages', sendMessage);
router.post('/sessions/:id/messages', sendMessage);
router.post('/messages', sendMessage);
router.put('/messages/:messageId/feedback', feedbackMessage);

module.exports = router;
