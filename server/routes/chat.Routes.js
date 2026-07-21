const express = require('express');

// Router
const router = express.Router();

const {
  createChat,
  getChats,
  getChat,
  renameChat,
  archiveChat,
  deleteChat,
} = require('../controllers/chat.controller');

const { protect } = require('../middlewares/authMiddleware');

/*
==================================================
Conversation Routes
==================================================
*/

// Protect all conversation routes
router.use(protect);

// Create Conversation
router.post('/conversation', createChat);

// Get All Conversations of User
router.get('/conversations/:userId', getChats);

// Get Single Conversation
router.get('/conversation/:conversationId', getChat);

// Rename Conversation
router.patch('/conversation/:conversationId/title', renameChat);

// Archive Conversation
router.patch('/conversation/:conversationId/archive', archiveChat);

// Delete Conversation
router.delete('/conversation/:conversationId', deleteChat);

module.exports = router;
