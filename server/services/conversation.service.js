const Conversation = require('../models/Conversation');
const logger = require('../utils/logger');

/**
 * Create a new conversation
 */
async function createConversation(userId) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const conversation = await Conversation.create({
    user: userId,
  });

  logger.info('Conversation created.', {
    conversationId: conversation._id,
    userId,
  });

  return conversation;
}

/**
 * Get a conversation by ID
 */
async function getConversation(conversationId) {
  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  return Conversation.findById(conversationId).lean();
}

/**
 * Get all active conversations of a user
 */
async function getUserConversations(userId) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  return Conversation.find({
    user: userId,
    isArchived: false,
  })
    .sort({
      lastMessageAt: -1,
    })
    .lean();
}

/**
 * Save a message
 */
async function saveMessage(conversationId, message) {
  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  return Conversation.findByIdAndUpdate(
    conversationId,
    {
      $push: {
        messages: message,
      },

      $set: {
        lastMessageAt: new Date(),
        lastActivity: new Date(),
      },
    },
    {
      new: true,
    },
  );
}

/**
 * Update conversation title
 */
async function updateTitle(conversationId, title) {
  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  return Conversation.findByIdAndUpdate(
    conversationId,
    {
      title,
    },
    {
      new: true,
    },
  );
}

/**
 * Archive conversation
 */
async function archiveConversation(conversationId) {
  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  return Conversation.findByIdAndUpdate(
    conversationId,
    {
      isArchived: true,
    },
    {
      new: true,
    },
  );
}

async function deleteConversation(conversationId) {
  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  return Conversation.findByIdAndDelete(conversationId);
}

async function renameConversation(conversationId, title) {
  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  return Conversation.findByIdAndUpdate(
    conversationId,
    {
      title: title.trim(),
    },
    {
      new: true,
    },
  );
}

module.exports = {
  createConversation,
  getConversation,
  getUserConversations,
  saveMessage,
  updateTitle,
  archiveConversation,
  deleteConversation,
  renameConversation,
};
