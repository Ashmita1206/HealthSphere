const logger = require('../utils/logger');
const { generateGeminiMultimodal, generateGeminiText } = require('./gemini/geminiService');

/**
 * Detects medical report type from document content and filenames
 */
function detectReportType(text = '', filename = '') {
  const combined = `${filename} ${text}`.toLowerCase();

  if (/x-ray|xray|radiograph|radiology|ct scan|mri|ultrasound|sonography/i.test(combined)) {
    return 'xray';
  }
  if (/complete blood count|cbc|hemoglobin|rbc|wbc|platelet|lipid|cholesterol|hba1c|glucose/i.test(combined)) {
    return 'blood';
  }
  if (/prescription|rx|tab\.|tablet|capsule|mg daily|take 1|sig:/i.test(combined)) {
    return 'prescription';
  }
  if (/biopsy|histopath|cytology|malignan|tissue/i.test(combined)) {
    return 'pathology';
  }
  if (/serum|creatinine|urea|electrolyte|urinalysis|liver function|lft|kft/i.test(combined)) {
    return 'lab';
  }

  return 'general';
}

/**
 * Robust OCR extraction service supporting images, PDFs, and text fallbacks
 * @param {Object} options
 * @param {string} [options.fileUrl]
 * @param {string} [options.base64Data]
 * @param {string} [options.mimeType]
 * @param {string} [options.rawText]
 * @returns {Promise<{ extractedText: string, reportType: string, ocrStatus: 'completed' | 'fallback' }>}
 */
async function extractTextFromDocument({ fileUrl = '', base64Data = '', mimeType = '', rawText = '', filename = '' } = {}) {
  // If text already exists, normalize and return
  if (rawText && typeof rawText === 'string' && rawText.trim().length > 10) {
    return {
      extractedText: rawText.trim(),
      reportType: detectReportType(rawText, filename),
      ocrStatus: 'completed',
    };
  }

  // Attempt Multimodal Gemini OCR if base64 / mimeType present
  if (base64Data && mimeType) {
    try {
      const prompt = `
You are a high-precision medical optical character recognition (OCR) engine.
Extract and transcribe ALL legible text from this medical report document verbatim.
Retain laboratory parameters, observed values, reference intervals, units of measure, patient data, and doctor notes.
Return plain text transcription only.
`;
      const transcribed = await generateGeminiMultimodal({ prompt, mimeType, base64Data });
      if (transcribed && transcribed.trim().length > 0) {
        return {
          extractedText: transcribed.trim(),
          reportType: detectReportType(transcribed, filename),
          ocrStatus: 'completed',
        };
      }
    } catch (err) {
      logger.warn('Multimodal OCR failed, using fallback', { error: err.message });
    }
  }

  // Fallback extraction when optical/multimodal engine is unavailable
  const fallbackText = fileUrl || filename
    ? `[OCR Fallback Analysis: Clinical Document "${filename || fileUrl.split('/').pop()}"]\nNo optical text layer detected. Processed with clinical heuristics.`
    : 'Clinical Laboratory Report\nRoutine diagnostic assessment records.';

  return {
    extractedText: fallbackText,
    reportType: detectReportType(fallbackText, filename),
    ocrStatus: 'fallback',
  };
}

module.exports = {
  extractTextFromDocument,
  detectReportType,
};
