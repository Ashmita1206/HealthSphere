const genAI = require('../config/gemini.config');

const buildPrompt = require('./promptBuilder');

const logger = require('../utils/logger');

const { AI_RESPONSE: DEFAULT_RESPONSE } = require('../utils/defaultResponses');

/**
 * Remove markdown code blocks if Gemini wraps JSON
 */
function cleanJSON(text = '') {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

/**
 * Safely parse JSON
 */
function parseAssistantJSON(text = '') {
  try {
    return JSON.parse(cleanJSON(text));
  } catch {
    return null;
  }
}

/**
 * Generate AI Response
 */
async function generateAIResponse({ user, chatHistory }) {
  try {
    const prompt = buildPrompt({
      user,
      chatHistory,
    });

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    console.log(text);

    if (!text) {
      logger.warn('Gemini returned an empty response.');

      return DEFAULT_RESPONSE;
    }

    const parsed = parseAssistantJSON(text);

    if (!parsed) {
      logger.warn('Gemini returned invalid JSON.', {
        rawResponse: text,
      });

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
    logger.error('Gemini API Error', {
      error: error.message,
      stack: error.stack,
    });

    return DEFAULT_RESPONSE;
  }
}

module.exports = {
  generateAIResponse,
};
