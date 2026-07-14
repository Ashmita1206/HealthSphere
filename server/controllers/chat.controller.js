const logger = require('../utils/logger');
const { success, failure } = require('../utils/responseFormatter');

const {
  createConversation,
  getConversation,
  getUserConversations,
  archiveConversation,
  deleteConversation,
  renameConversation,
} = require('../services/conversation.service');

/*
==================================================
Create Conversation
POST /api/chat/conversation
==================================================
*/

async function createChat(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(failure('User ID is required.'));
    }

    const conversation = await createConversation(userId);

    logger.info('Conversation created', {
      conversationId: conversation._id,
    });

    return res.status(201).json(success(conversation));
  } catch (error) {
    logger.error('Create Conversation Failed', {
      error: error.message,
    });

    return res.status(500).json(failure(error.message));
  }
}

/*
==================================================
Get All Conversations
GET /api/chat/conversations/:userId
==================================================
*/

async function getChats(req, res) {
  try {
    const { userId } = req.params;

    const conversations = await getUserConversations(userId);

    return res.status(200).json(success(conversations));
  } catch (error) {
    logger.error('Fetch Conversations Failed', {
      error: error.message,
    });

    return res.status(500).json(failure(error.message));
  }
}

/*
==================================================
Get Single Conversation
GET /api/chat/conversation/:conversationId
==================================================
*/

async function getChat(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation = await getConversation(conversationId);

    if (!conversation) {
      return res.status(404).json(failure('Conversation not found.'));
    }

    return res.status(200).json(success(conversation));
  } catch (error) {
    logger.error('Fetch Conversation Failed', {
      error: error.message,
    });

    return res.status(500).json(failure(error.message));
  }
}

/*
==================================================
Rename Conversation
PATCH /api/chat/conversation/:conversationId/title
==================================================
*/

async function renameChat(req, res) {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;

    if (!title?.trim()) {
      return res.status(400).json(failure('Title is required.'));
    }

    const conversation = await renameConversation(conversationId, title);

    return res.status(200).json(success(conversation));
  } catch (error) {
    logger.error('Rename Conversation Failed', {
      error: error.message,
    });

    return res.status(500).json(failure(error.message));
  }
}

/*
==================================================
Archive Conversation
PATCH /api/chat/conversation/:conversationId/archive
==================================================
*/

async function archiveChat(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation = await archiveConversation(conversationId);

    return res.status(200).json(success(conversation));
  } catch (error) {
    logger.error('Archive Conversation Failed', {
      error: error.message,
    });

    return res.status(500).json(failure(error.message));
  }
}

/*
==================================================
Delete Conversation
DELETE /api/chat/conversation/:conversationId
==================================================
*/

async function deleteChat(req, res) {
  try {
    const { conversationId } = req.params;

    await deleteConversation(conversationId);

    return res.status(200).json(
      success({
        message: 'Conversation deleted successfully.',
      }),
    );
  } catch (error) {
    logger.error('Delete Conversation Failed', {
      error: error.message,
    });

    return res.status(500).json(failure(error.message));
  }
}

module.exports = {
  createChat,
  getChats,
  getChat,
  renameChat,
  archiveChat,
  deleteChat,
};
