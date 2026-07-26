const { generateGeminiText, safeParseJSON } = require('./gemini/geminiService');
const buildPrompt = require('./promptBuilder');
const logger = require('../utils/logger');
const { AI_RESPONSE: DEFAULT_RESPONSE } = require('../utils/defaultResponses');

/**
 * Generate AI Response
 */
async function generateAIResponse({ user, chatHistory }) {
  try {
    const prompt = buildPrompt({
      user,
      chatHistory,
    });

    const text = await generateGeminiText({ prompt });

    if (!text) {
      logger.warn('Gemini returned an empty response.');
      return DEFAULT_RESPONSE;
    }

    const parsed = safeParseJSON(text, null);

    if (!parsed) {
      logger.warn('Gemini returned invalid JSON.', { rawResponse: text });
      return DEFAULT_RESPONSE;
    }

    return {
      response: parsed.response?.trim() || DEFAULT_RESPONSE.response,

      followUpQuestions: Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions
        : DEFAULT_RESPONSE.followUpQuestions,

      healthCategory: parsed.healthCategory || DEFAULT_RESPONSE.healthCategory,
    };
  } catch (error) {
    logger.error('Gemini API Error in ai.service.js', {
      error: error.message,
      stack: error.stack,
    });

    return DEFAULT_RESPONSE;
  }
}

module.exports = {
  generateAIResponse,
};

