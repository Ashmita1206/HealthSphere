const { genAI, AI_MODEL, isConfigured } = require('../../config/gemini.config');
const logger = require('../../utils/logger');

/**
 * Custom Error class for Gemini API errors
 */
class GeminiError extends Error {
  constructor(message, code = 'PROVIDER_ERROR', statusCode = 503) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Redact API keys or sensitive authorization tokens from strings / error objects
 */
function sanitizeMessage(str = '') {
  if (typeof str !== 'string') return '';
  return str
    .replace(/(?:key=|apiKey=|GEMINI_API_KEY=)[A-Za-z0-9_\-\.]{20,}/gi, '$1[REDACTED_API_KEY]')
    .replace(/AQ\.[A-Za-z0-9_\-]{30,}/g, '[REDACTED_API_KEY]')
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
}

/**
 * Sanitize error objects before logging
 */
function sanitizeError(err) {
  if (!err) return { message: 'Unknown error' };
  const message = sanitizeMessage(err.message || String(err));
  return {
    name: err.name || 'Error',
    code: err.code || 'UNKNOWN_ERROR',
    message,
    status: err.status || err.statusCode || null,
  };
}

/**
 * Execute a promise with a timeout threshold (default 30 seconds)
 */
function withTimeout(promise, timeoutMs = 30000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new GeminiError('Gemini API request timed out. Please try again.', 'TIMEOUT', 504));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

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
 * Parse JSON safely without leaking sensitive health context in logs
 */
function safeParseJSON(text = '', fallback = null) {
  if (!text) return fallback;
  try {
    return JSON.parse(cleanJSON(text));
  } catch (err) {
    logger.warn('Gemini JSON Parse warning', {
      error: err.message,
      textLength: text.length,
    });
    return fallback;
  }
}

/**
 * Map raw provider errors into safe application GeminiError
 */
function normalizeProviderError(error) {
  const msg = error.message ? error.message.toLowerCase() : '';
  const status = error.status || error.statusCode || 500;

  if (error instanceof GeminiError) {
    return error;
  }

  if (msg.includes('api_key') || msg.includes('unauthorized') || msg.includes('invalid api key') || status === 401 || status === 403) {
    return new GeminiError('AI provider authentication failed. Please verify server API configuration.', 'MISSING_API_KEY', 503);
  }

  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted') || status === 429) {
    return new GeminiError('AI request rate limit exceeded. Please wait a moment before retrying.', 'RATE_LIMIT_EXCEEDED', 429);
  }

  if (msg.includes('400') || msg.includes('invalid argument') || status === 400) {
    return new GeminiError('Invalid AI request payload provided.', 'INVALID_REQUEST', 400);
  }

  if (msg.includes('fetch failed') || msg.includes('econnreset') || msg.includes('enotfound') || msg.includes('network')) {
    return new GeminiError('Network error connecting to AI provider.', 'NETWORK_ERROR', 503);
  }

  if (status >= 500 || msg.includes('internal') || msg.includes('unavailable') || msg.includes('overloaded')) {
    return new GeminiError('AI service is temporarily unavailable. Please try again shortly.', 'PROVIDER_ERROR', 503);
  }

  return new GeminiError('An error occurred while communicating with the AI service.', 'PROVIDER_ERROR', 503);
}

/**
 * Generate text content using Gemini
 */
async function generateGeminiText({ prompt, systemInstruction = '', model = AI_MODEL, temperature = 0.2, timeoutMs = 30000 }) {
  if (!isConfigured()) {
    logger.warn('Gemini generateGeminiText called but GEMINI_API_KEY is not configured');
    throw new GeminiError('AI service is not configured on the server.', 'MISSING_API_KEY', 503);
  }

  const selectedModel = model || AI_MODEL;

  try {
    const contents = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    const apiCall = genAI.models.generateContent({
      model: selectedModel,
      contents,
      config: { temperature },
    });

    const response = await withTimeout(apiCall, timeoutMs);

    const candidate = response.candidates?.[0];
    if (!candidate) {
      logger.warn('Gemini returned no response candidates');
      return '';
    }

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      logger.warn('Gemini finished with non-standard reason', { finishReason: candidate.finishReason });
    }

    const text = candidate.content?.parts?.[0]?.text?.trim() || '';
    return text;
  } catch (error) {
    const normalized = normalizeProviderError(error);
    logger.error('Gemini generateGeminiText error', sanitizeError(error));
    throw normalized;
  }
}

/**
 * Multimodal input processing (Images/PDF base64)
 */
async function generateGeminiMultimodal({ prompt, mimeType, base64Data, model = AI_MODEL, timeoutMs = 30000 }) {
  if (!isConfigured()) {
    logger.warn('Gemini generateGeminiMultimodal called but GEMINI_API_KEY is not configured');
    throw new GeminiError('AI service is not configured on the server.', 'MISSING_API_KEY', 503);
  }

  const selectedModel = model || AI_MODEL;

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

    const apiCall = genAI.models.generateContent({
      model: selectedModel,
      contents,
    });

    const response = await withTimeout(apiCall, timeoutMs);

    const candidate = response.candidates?.[0];
    if (!candidate) {
      logger.warn('Gemini Multimodal returned no response candidates');
      return '';
    }

    const text = candidate.content?.parts?.[0]?.text?.trim() || '';
    return text;
  } catch (error) {
    const normalized = normalizeProviderError(error);
    logger.error('Gemini Multimodal error', sanitizeError(error));
    throw normalized;
  }
}

module.exports = {
  GeminiError,
  generateGeminiText,
  generateGeminiMultimodal,
  cleanJSON,
  safeParseJSON,
  sanitizeMessage,
  sanitizeError,
};
