const User = require('../models/User');

const { getConversation } = require('./conversation.service');

const { MAX_MESSAGE_LENGTH } = require('../utils/constants');

/**
 * Validate incoming user message
 */
function validateMessage(message) {
  if (message === undefined || message === null) {
    throw new Error('Message is required.');
  }

  if (typeof message !== 'string') {
    throw new Error('Message must be a string.');
  }

  if (!message.trim()) {
    throw new Error('Message cannot be empty.');
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
  }
}

/**
 * Validate conversation exists
 */
async function validateConversation(conversationId) {
  if (!conversationId) {
    throw new Error('Conversation ID is required.');
  }

  const conversation = await getConversation(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found.');
  }

  return conversation;
}

/**
 * Validate user exists
 */
async function validateUser(userId) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found.');
  }

  return user;
}

module.exports = {
  validateMessage,
  validateConversation,
  validateUser,
};
