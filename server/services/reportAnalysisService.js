const logger = require('../utils/logger');
const { generateGeminiText, safeParseJSON } = require('./gemini/geminiService');

const REPORT_DISCLAIMER =
  'HealthSphere AI Medical Report Analysis is intended for informational and clinical decision-support purposes only. It does not replace professional medical judgment, diagnosis, or treatment by a qualified healthcare provider.';

/**
 * Standard reference ranges for common biomarkers
 */
const BIOMARKER_STANDARDS = [
  { name: 'Fasting Blood Sugar (Glucose)', aliases: ['glucose', 'fbs', 'blood sugar', 'fasting glucose'], min: 70, max: 100, criticalMax: 250, criticalMin: 50, unit: 'mg/dL' },
  { name: 'HbA1c (Glycated Hemoglobin)', aliases: ['hba1c', 'glycated hemoglobin', 'a1c'], min: 4.0, max: 5.7, criticalMax: 9.5, criticalMin: 3.5, unit: '%' },
  { name: 'Total Cholesterol', aliases: ['cholesterol', 'total cholesterol'], min: 125, max: 200, criticalMax: 300, criticalMin: 90, unit: 'mg/dL' },
  { name: 'LDL Cholesterol', aliases: ['ldl', 'bad cholesterol'], min: 50, max: 100, criticalMax: 190, criticalMin: 30, unit: 'mg/dL' },
  { name: 'HDL Cholesterol', aliases: ['hdl', 'good cholesterol'], min: 40, max: 60, criticalMax: 100, criticalMin: 25, unit: 'mg/dL' },
  { name: 'Triglycerides', aliases: ['triglycerides', 'tg'], min: 50, max: 150, criticalMax: 500, criticalMin: 30, unit: 'mg/dL' },
  { name: 'Serum Creatinine', aliases: ['creatinine', 'serum creatinine'], min: 0.6, max: 1.2, criticalMax: 3.0, criticalMin: 0.3, unit: 'mg/dL' },
  { name: 'Hemoglobin', aliases: ['hemoglobin', 'hb'], min: 12.0, max: 17.5, criticalMax: 20.0, criticalMin: 7.0, unit: 'g/dL' },
  { name: 'Platelet Count', aliases: ['platelets', 'platelet count'], min: 150000, max: 450000, criticalMax: 800000, criticalMin: 50000, unit: '/mcL' },
  { name: 'White Blood Cell Count', aliases: ['wbc', 'total leukocytes', 'leukocyte count'], min: 4500, max: 11000, criticalMax: 25000, criticalMin: 2000, unit: '/mcL' },
];

/**
 * Heuristic rule-based extractor for laboratory biomarkers
 */
function analyzeBiomarkersFromText(text = '') {
  const abnormalValues = [];
  const keyFindings = [];

  for (const biomarker of BIOMARKER_STANDARDS) {
    for (const alias of biomarker.aliases) {
      // Regex pattern to capture e.g. "Glucose: 195 mg/dL" or "HbA1c = 7.2%"
      const regex = new RegExp(
        `(?:${alias})\\s*[:=–\\-]?\\s*([0-9]+(?:\\.[0-9]+)?)\\s*(?:${biomarker.unit.replace('/', '\\/')})?`,
        'i'
      );
      const match = text.match(regex);
      if (match) {
        const val = parseFloat(match[1]);
        if (!isNaN(val)) {
          if (val > biomarker.max) {
            const isCritical = biomarker.criticalMax ? val >= biomarker.criticalMax : val > biomarker.max * 2.0;
            const severity = isCritical ? 'Critical' : 'High';
            abnormalValues.push({
              parameter: biomarker.name,
              value: `${val} ${biomarker.unit}`,
              normalRange: `${biomarker.min} - ${biomarker.max} ${biomarker.unit}`,
              severity,
              note: `Elevated above upper threshold (${biomarker.max} ${biomarker.unit})`,
            });
            keyFindings.push(`${biomarker.name} is elevated at ${val} ${biomarker.unit}.`);
          } else if (val < biomarker.min) {
            const isCritical = biomarker.criticalMin ? val <= biomarker.criticalMin : val < biomarker.min * 0.5;
            const severity = isCritical ? 'Critical' : 'Moderate';
            abnormalValues.push({
              parameter: biomarker.name,
              value: `${val} ${biomarker.unit}`,
              normalRange: `${biomarker.min} - ${biomarker.max} ${biomarker.unit}`,
              severity,
              note: `Below standard reference minimum (${biomarker.min} ${biomarker.unit})`,
            });
            keyFindings.push(`${biomarker.name} is low at ${val} ${biomarker.unit}.`);
          } else {
            keyFindings.push(`${biomarker.name} is within normal reference limits (${val} ${biomarker.unit}).`);
          }
          break; // Avoid matching duplicate aliases
        }
      }
    }
  }

  return { abnormalValues, keyFindings };
}

/**
 * Clinical evaluation of X-Ray / Radiology reports
 */
function analyzeRadiologyFindings(text = '') {
  const abnormal = [];
  const findings = [];

  const patterns = [
    { term: /cardiomegaly/i, name: 'Cardiomegaly', severity: 'High', note: 'Enlarged cardiac silhouette noted' },
    { term: /effusion|pleural effusion/i, name: 'Pleural Effusion', severity: 'High', note: 'Fluid collection in pleural cavity' },
    { term: /consolidation|infiltrate/i, name: 'Pulmonary Infiltrates/Consolidation', severity: 'High', note: 'Opacities consistent with potential infection' },
    { term: /fracture/i, name: 'Bony Fracture', severity: 'High', note: 'Disruption in cortical bone continuity' },
    { term: /atelectasis/i, name: 'Atelectasis', severity: 'Moderate', note: 'Partial lung collapse observed' },
    { term: /pneumothorax/i, name: 'Pneumothorax', severity: 'Critical', note: 'Abnormal air collection in pleural space' },
  ];

  for (const p of patterns) {
    if (p.term.test(text)) {
      abnormal.push({
        parameter: p.name,
        value: 'Detected',
        normalRange: 'Clear / None',
        severity: p.severity,
        note: p.note,
      });
      findings.push(`Radiology finding: ${p.name} detected on image evaluation.`);
    }
  }

  if (!findings.length) {
    findings.push('No acute cardiopulmonary or osseous abnormalities identified.');
  }

  return { abnormalValues: abnormal, keyFindings: findings };
}

/**
 * Clinical evaluation of Prescription reports
 */
function analyzePrescriptionFindings(text = '') {
  const findings = [];
  const abnormal = [];

  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  for (const line of lines) {
    if (/tab\.|cap\.|tablet|capsule|mg|syrup|daily/i.test(line)) {
      findings.push(`Prescription item: ${line.trim()}`);
    }
  }

  if (!findings.length) {
    findings.push('Prescription instructions transcribed.');
  }

  return { abnormalValues: abnormal, keyFindings: findings };
}

/**
 * Analyzes medical reports across blood tests, X-rays, prescriptions, and lab panels
 * @param {Object} report
 * @param {string} report.extractedText
 * @param {string} report.reportType - 'blood' | 'xray' | 'prescription' | 'lab' | 'pathology' | 'general'
 * @param {string} [report.title]
 * @returns {Promise<Object>} Formatted AI report analysis
 */
async function analyzeMedicalReport({ extractedText = '', reportType = 'general', title = 'Medical Report' } = {}) {
  let abnormalValues = [];
  let keyFindings = [];

  const text = extractedText || '';

  // 1. Specialized clinical rule-based analysis
  if (reportType === 'blood' || reportType === 'lab') {
    const res = analyzeBiomarkersFromText(text);
    abnormalValues = res.abnormalValues;
    keyFindings = res.keyFindings;
  } else if (reportType === 'xray') {
    const res = analyzeRadiologyFindings(text);
    abnormalValues = res.abnormalValues;
    keyFindings = res.keyFindings;
  } else if (reportType === 'prescription') {
    const res = analyzePrescriptionFindings(text);
    abnormalValues = res.abnormalValues;
    keyFindings = res.keyFindings;
  } else {
    // General / multi-type text search
    const bioRes = analyzeBiomarkersFromText(text);
    const radRes = analyzeRadiologyFindings(text);
    abnormalValues = [...bioRes.abnormalValues, ...radRes.abnormalValues];
    keyFindings = [...bioRes.keyFindings, ...radRes.keyFindings];
  }

  // 2. Determine Risk Level
  let riskLevel = 'low';
  if (abnormalValues.some((a) => a.severity === 'Critical')) {
    riskLevel = 'critical';
  } else if (abnormalValues.some((a) => a.severity === 'High')) {
    riskLevel = 'high';
  } else if (abnormalValues.length > 0) {
    riskLevel = 'moderate';
  }

  // 3. Formulate Summary
  let summary = '';
  if (riskLevel === 'critical' || riskLevel === 'high') {
    summary = `Clinical report analysis indicates ${abnormalValues.length} abnormal finding(s) requiring prompt medical review with your physician.`;
  } else if (riskLevel === 'moderate') {
    summary = `Clinical report shows borderline or mild variations across ${abnormalValues.length} metric(s). Follow-up and lifestyle adjustments recommended.`;
  } else {
    summary = `Report evaluation indicates parameters are largely within standard physiological reference ranges.`;
  }

  // 4. Formulate Doctor Questions
  const doctorQuestions = [];
  if (abnormalValues.length > 0) {
    doctorQuestions.push(`What lifestyle or medical interventions are recommended for my abnormal ${abnormalValues[0].parameter}?`);
    doctorQuestions.push('Do I need follow-up re-testing or additional specialized scans?');
  } else {
    doctorQuestions.push('What preventive routines should I maintain based on these results?');
  }

  // 5. Formulate Actionable Recommendations
  const recommendations = [];
  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('Schedule an in-person or telemedicine clinical review with your doctor.');
    recommendations.push('Keep a log of any accompanying physical symptoms.');
  } else if (riskLevel === 'moderate') {
    recommendations.push('Discuss these lab trends during your next routine medical checkup.');
    recommendations.push('Review diet, hydration, and exercise habits relevant to flagged parameters.');
  } else {
    recommendations.push('Continue balanced nutrition and annual wellness health evaluations.');
  }

  return {
    summary,
    keyFindings: keyFindings.length ? keyFindings : ['Report reviewed. No acute clinical concerns flagged.'],
    abnormalValues,
    riskLevel,
    doctorQuestions,
    recommendations,
    disclaimer: REPORT_DISCLAIMER,
  };
}

module.exports = {
  analyzeMedicalReport,
  analyzeBiomarkersFromText,
  analyzeRadiologyFindings,
  REPORT_DISCLAIMER,
};
