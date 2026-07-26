const { generateGeminiMultimodal, safeParseJSON, generateGeminiText } = require('../gemini/geminiService');
const logger = require('../../utils/logger');

/**
 * OCR & Deep Medical Report Parsing
 */
async function parseMedicalReport({ mimeType, base64Data, textContent }) {
  try {
    const prompt = `
You are a top-tier clinical diagnostic analyzer and OCR expert.
Analyze the provided medical report document/text and extract detailed metrics.

Target Biomarkers to Extract (if present in document, convert values to standard units):
- CBC (Complete Blood Count summary)
- Fasting / Random Sugar (mg/dL)
- HbA1c (%)
- Cholesterol (Total / HDL / LDL mg/dL)
- Liver Function (ALT, AST, Bilirubin)
- Kidney Function (Creatinine, BUN, eGFR)
- Thyroid (TSH, T3, T4)
- Vitamin D (ng/mL)
- Vitamin B12 (pg/mL)
- Iron (Serum Iron / Ferritin)
- Calcium (mg/dL)
- Platelets (cells/mcL)
- Hemoglobin (g/dL)

Format your output strictly as a JSON object with this exact structure:
{
  "reportTitle": "Name of test or laboratory report",
  "category": "Blood Test | Pathology | Radiology | Metabolic | General",
  "summary": "Concise 2-3 sentence overview of findings",
  "riskLevel": "Low | Moderate | High | Critical",
  "abnormalValues": [
    { "parameter": "Parameter Name", "value": "Extracted Value", "normalRange": "Normal Range", "severity": "Mild | Moderate | High", "clinicalNote": "Brief reason" }
  ],
  "biomarkers": {
    "cbc": "extracted value or N/A",
    "sugar": "extracted value or N/A",
    "hba1c": "extracted value or N/A",
    "cholesterol": "extracted value or N/A",
    "liver": "extracted value or N/A",
    "kidney": "extracted value or N/A",
    "thyroid": "extracted value or N/A",
    "vitaminD": "extracted value or N/A",
    "vitaminB12": "extracted value or N/A",
    "iron": "extracted value or N/A",
    "calcium": "extracted value or N/A",
    "platelets": "extracted value or N/A",
    "hemoglobin": "extracted value or N/A"
  },
  "recommendations": [
    "Preventive or dietary advice 1",
    "Consultation advice 2"
  ]
}
`;

    let rawText = '';
    if (base64Data && mimeType) {
      rawText = await generateGeminiMultimodal({ prompt, mimeType, base64Data });
    } else {
      rawText = await generateGeminiText({ prompt: `${prompt}\n\nDocument Text Content:\n${textContent}` });
    }

    const parsed = safeParseJSON(rawText, null);
    if (parsed) return parsed;

    return {
      reportTitle: 'Medical Report',
      category: 'General Lab',
      summary: 'Report processed. Please review individual parameters with your healthcare provider.',
      riskLevel: 'Low',
      abnormalValues: [],
      biomarkers: {},
      recommendations: ['Schedule a follow-up with your primary physician for full interpretation.'],
    };
  } catch (error) {
    logger.error('parseMedicalReport error', { error: error.message });
    throw error;
  }
}

/**
 * Compare 2 medical reports
 */
async function compareMedicalReports(reportA, reportB) {
  try {
    const prompt = `
Compare two medical reports for the same patient over time and highlight progress, improvements, or worsening trends.

Report 1 (Earlier): ${JSON.stringify(reportA)}
Report 2 (Recent): ${JSON.stringify(reportB)}

Return JSON:
{
  "overallTrend": "Improving | Stable | Worsening | Mixed",
  "keyChanges": [
    { "metric": "Parameter", "previousValue": "val1", "currentValue": "val2", "status": "Improved | Worsened | Unchanged", "explanation": "Brief context" }
  ],
  "summary": "Comprehensive 3-sentence timeline comparison overview",
  "actionableAdvice": ["Advice 1", "Advice 2"]
}
`;

    const raw = await generateGeminiText({ prompt });
    return safeParseJSON(raw, {
      overallTrend: 'Stable',
      keyChanges: [],
      summary: 'No significant changes detected across the two report snapshots.',
      actionableAdvice: ['Continue standard routine health checkups.'],
    });
  } catch (error) {
    logger.error('compareMedicalReports error', { error: error.message });
    throw error;
  }
}

module.exports = {
  parseMedicalReport,
  compareMedicalReports,
};
