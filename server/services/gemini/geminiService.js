const { genAI, AI_MODEL } = require('../../config/gemini.config');
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
 * Helper to categorize Gemini API errors into clean structured responses
 */
function handleGeminiError(error, contextName = 'Gemini API') {
  const errMsg = error?.message || String(error);
  const status = error?.status || error?.statusCode;

  logger.error(`${contextName} error`, {
    error: errMsg,
    status,
    code: error?.code,
  });

  let category = 'UNKNOWN_ERROR';
  let userFriendlyMessage = 'An unexpected AI service error occurred. Please try again.';

  if (status === 401 || errMsg.includes('401') || errMsg.includes('API key') || errMsg.includes('UNAUTHENTICATED')) {
    category = 'UNAUTHORIZED';
    userFriendlyMessage = 'Invalid or missing Gemini API Key. Please verify your GEMINI_API_KEY configuration.';
  } else if (status === 403 || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
    category = 'PERMISSION_DENIED';
    userFriendlyMessage = 'Gemini API access denied or forbidden. Check project permissions or API restrictions.';
  } else if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota')) {
    category = 'RATE_LIMIT_EXCEEDED';
    userFriendlyMessage = 'Gemini API quota or rate limit exceeded. Please wait a moment before retrying.';
  } else if (status >= 500 || errMsg.includes('500') || errMsg.includes('INTERNAL')) {
    category = 'SERVER_ERROR';
    userFriendlyMessage = 'Google AI Studio service is currently experiencing high load or internal error.';
  } else if (errMsg.includes('ENOTFOUND') || errMsg.includes('ETIMEDOUT') || errMsg.includes('fetch failed')) {
    category = 'NETWORK_ERROR';
    userFriendlyMessage = 'Network connection failed while reaching Gemini AI servers.';
  }

  const structuredError = new Error(userFriendlyMessage);
  structuredError.category = category;
  structuredError.originalError = errMsg;
  structuredError.statusCode = status || 500;
  return structuredError;
}

/**
 * Generate text content using Gemini API
 */
async function generateGeminiText({ prompt, systemInstruction = '', model = AI_MODEL, temperature = 0.2 }) {
  try {
    const contents = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    const response = await genAI.models.generateContent({
      model: model || AI_MODEL,
      contents,
      config: { temperature },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || response.text || '';
    return text;
  } catch (error) {
    throw handleGeminiError(error, 'generateGeminiText');
  }
}

/**
 * Multimodal input processing (Images/PDF base64)
 */
async function generateGeminiMultimodal({ prompt, mimeType, base64Data, model = AI_MODEL }) {
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
      model: model || AI_MODEL,
      contents,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || response.text || '';
    return text;
  } catch (error) {
    throw handleGeminiError(error, 'generateGeminiMultimodal');
  }
}

/**
 * Streaming content generation using generateContentStream API
 */
async function generateGeminiStream({ prompt, systemInstruction = '', model = AI_MODEL, temperature = 0.2, onChunk }) {
  try {
    const contents = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    const responseStream = await genAI.models.generateContentStream({
      model: model || AI_MODEL,
      contents,
      config: { temperature },
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      const chunkText = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (chunkText) {
        fullText += chunkText;
        if (onChunk) onChunk(chunkText);
      }
    }
    return fullText;
  } catch (error) {
    throw handleGeminiError(error, 'generateGeminiStream');
  }
}

module.exports = {
  generateGeminiText,
  generateGeminiMultimodal,
  generateGeminiStream,
  cleanJSON,
  safeParseJSON,
  handleGeminiError,
};

