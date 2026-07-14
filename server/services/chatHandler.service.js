const logger = require('../utils/logger');

const sanitizeMessage = require('../utils/sanitizeMessage');

const { saveMessage, updateTitle } = require('./conversation.service');

const { addMessage, getHistory } = require('./chatHistory.service');

const { computeRiskFromText } = require('./riskEngine');

const { buildRecommendations } = require('./recommendationEngine');

const { generateAIResponse } = require('./ai.service');

const {
  validateConversation,
  validateUser,
  validateMessage,
} = require('./chatValidation.service');

const { generateConversationTitle } = require('./title.service');

async function handleUserMessage({ conversationId, userMessage }) {
  /*
  ==========================================
  Validate Input
  ==========================================
  */

  validateMessage(userMessage);

  userMessage = sanitizeMessage(userMessage);

  /*
  ==========================================
  Validate Conversation & User
  ==========================================
  */

  const conversation = await validateConversation(conversationId);

  const user = await validateUser(conversation.user);

  /*
  ==========================================
  Save User Message
  ==========================================
  */

  const userChat = {
    role: 'user',
    text: userMessage,
  };

  await saveMessage(conversationId, userChat);

  addMessage(conversationId, userChat);

  logger.info('User message saved.', {
    conversationId,
    userId: user._id,
  });

  /*
  ==========================================
  Health Risk Analysis
  ==========================================
  */

  const risk = computeRiskFromText(userMessage);

  const recommendations = buildRecommendations(risk);

  /*
  ==========================================
  Short-Term Memory
  ==========================================
  */

  const chatHistory = getHistory(conversationId);

  /*
  ==========================================
  Generate AI Response
  ==========================================
  */

  let ai;

  try {
    ai = await generateAIResponse({
      user,
      chatHistory,
    });
  } catch (error) {
    logger.error('Gemini generation failed.', {
      error: error.message,
      conversationId,
    });

    ai = {
      response:
        "I'm sorry, I'm unable to generate a response right now. Please try again shortly.",

      followUpQuestions: [],

      healthCategory: 'General Health',
    };
  }

  /*
  ==========================================
  Save AI Response
  ==========================================
  */

  const aiMessage = {
    role: 'model',

    text: ai.response,

    riskLevel: risk.riskLevel,

    recommendations,

    requiresDoctor: risk.requiresDoctor,
  };

  try {
    await saveMessage(conversationId, aiMessage);

    addMessage(conversationId, aiMessage);

    logger.info('AI response saved.', {
      conversationId,
      userId: user._id,
    });
  } catch (error) {
    logger.error('Failed to save AI response.', {
      conversationId,
      userId: user._id,
      error: error.message,
    });
  }

  /*
  ==========================================
  Generate Conversation Title
  ==========================================
  */

  if (
    conversation.messages.length === 0 &&
    (!conversation.title || conversation.title === 'New Conversation')
  ) {
    try {
      const title = generateConversationTitle(userMessage);

      await updateTitle(conversationId, title);

      conversation.title = title;

      logger.info('Conversation title updated.', {
        conversationId,
        title,
      });
    } catch (error) {
      logger.error('Failed to update conversation title.', {
        conversationId,
        error: error.message,
      });
    }
  }

  /*
  ==========================================
  Return Response
  ==========================================
  */

  return {
    response: ai.response,

    followUpQuestions: ai.followUpQuestions || [],

    healthCategory: ai.healthCategory || 'General Health',

    riskLevel: risk.riskLevel,

    recommendations,

    requiresDoctor: risk.requiresDoctor,
  };
}

module.exports = {
  handleUserMessage,
};
