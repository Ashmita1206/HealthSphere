const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY is missing in .env. AI requests will fail until configured.');
}

const genAI = new GoogleGenAI({
  apiKey: apiKey,
});

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const AI_MODEL = process.env.AI_MODEL || 'gemini-flash-latest';

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

module.exports = {
  genAI,
  AI_PROVIDER,
  AI_MODEL,
  isConfigured,
};
