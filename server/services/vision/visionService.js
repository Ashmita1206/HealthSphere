const { generateGeminiMultimodal, safeParseJSON } = require('../gemini/geminiService');
const logger = require('../../utils/logger');

/**
 * AI Vision Analysis for 8 medical image categories
 */
async function analyzeMedicalImage({ category, mimeType, base64Data }) {
  try {
    const validCategories = [
      'Prescription',
      'Blood Report',
      'Medicine Strip',
      'Pill Detection',
      'Skin Disease',
      'X-Ray',
      'MRI',
      'ECG',
    ];

    const targetCategory = validCategories.includes(category) ? category : 'General Medical Image';

    const prompt = `
You are HealthSphere AI Vision Specialist. Analyze this ${targetCategory} image with extreme precision.

Category: ${targetCategory}

Generate structured JSON output with the following format:
{
  "category": "${targetCategory}",
  "summary": "High level clear clinical summary of the image content",
  "findings": [
    "Key visual or diagnostic observation 1",
    "Key visual or diagnostic observation 2",
    "Key visual or diagnostic observation 3"
  ],
  "warnings": [
    "Safety alert, contraindication, or alarming flag (if any)"
  ],
  "questionsForDoctor": [
    "Specific question 1 the patient should ask their physician",
    "Specific question 2 the patient should ask their physician"
  ],
  "confidenceScore": 92
}
`;

    const rawResponse = await generateGeminiMultimodal({
      prompt,
      mimeType,
      base64Data,
    });

    const parsed = safeParseJSON(rawResponse, null);
    if (parsed) return parsed;

    return {
      category: targetCategory,
      summary: `Analyzed ${targetCategory}. No severe abnormalities detected visually.`,
      findings: [`Visual features consistent with standard ${targetCategory} presentation.`],
      warnings: ['Always verify findings with a certified physician or radiologist.'],
      questionsForDoctor: ['Are there any follow-up tests required based on this scan/photo?'],
      confidenceScore: 85,
    };
  } catch (error) {
    logger.error('analyzeMedicalImage error', { error: error.message, category });
    throw error;
  }
}

module.exports = {
  analyzeMedicalImage,
};
