const genAI = require('../../config/gemini.config');
const logger = require('../../utils/logger');

/**
 * Clean markdown wrapper if model returns codeblocks
 */
function cleanJSON(text = '') {
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

/**
 * Parse JSON safely
 */
function safeParseJSON(text = '', fallback = null) {
  try {
    return JSON.parse(cleanJSON(text));
  } catch (err) {
    logger.warn('Gemini JSON Parse warning', { error: err.message, raw: text });
    return fallback;
  }
}

/**
 * Generate text content using Gemini
 */
async function generateGeminiText({ prompt, systemInstruction = '', model = 'gemini-flash-latest', temperature = 0.2 }) {
  try {
    const contents = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    const response = await genAI.models.generateContent({
      model,
      contents,
      config: { temperature },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return text;
  } catch (error) {
    logger.error('Gemini generateGeminiText error', { error: error.message });
    throw error;
  }
}

/**
 * Multimodal input processing (Images/PDF base64)
 */
async function generateGeminiMultimodal({ prompt, mimeType, base64Data, model = 'gemini-2.5-flash' }) {
  try {
    const contents = [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt },
        ],
      },
    ];

    const response = await genAI.models.generateContent({
      model,
      contents,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return text;
  } catch (error) {
    logger.error('Gemini Multimodal error', { error: error.message });
    throw error;
  }
}

module.exports = {
  generateGeminiText,
  generateGeminiMultimodal,
  cleanJSON,
  safeParseJSON,
};
