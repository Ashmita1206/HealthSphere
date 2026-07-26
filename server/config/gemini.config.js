const { GoogleGenAI } = require('@google/genai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY is missing in .env. AI requests will fail until configured.');
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const AI_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

module.exports = {
  genAI,
  AI_PROVIDER,
  AI_MODEL,
};

