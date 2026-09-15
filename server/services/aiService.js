const OpenAI = require('openai');
const { computeRiskFromText } = require('./riskEngine');
const { buildRecommendations, buildHealthInsights } = require('./recommendationEngine');
const logger = require('../utils/logger');

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const MEDICAL_DISCLAIMER =
  'HealthSphere AI provides general wellness and clinical decision-support analytics only. It does NOT provide a final medical diagnosis or replace consultation with a licensed healthcare provider.';

function parseAssistantJSON(text) {
  try {
    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (_e) {
    return null;
  }
}

async function getAIHealthResponse({ userMessage }) {
  const fallbackRisk = computeRiskFromText(userMessage);
  const fallback = {
    response:
      'I can help you understand your symptoms, but this is not a diagnosis. Please seek professional care if you feel unsafe.',
    riskLevel: fallbackRisk.riskLevel,
    recommendations: buildRecommendations(fallbackRisk),
    requiresDoctor: fallbackRisk.requiresDoctor,
    disclaimer: MEDICAL_DISCLAIMER,
  };

  if (!client) return fallback;

  const systemPrompt =
    'You are HealthSphere AI, a cautious healthcare assistant. Return ONLY valid JSON with keys: response, riskLevel, recommendations, requiresDoctor. riskLevel must be one of low, medium, high, critical. Never diagnose. Keep response concise and safety-first.';

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    const text = completion.choices?.[0]?.message?.content || '';
    const parsed = parseAssistantJSON(text);
    if (!parsed) return fallback;
    return {
      response: parsed.response || fallback.response,
      riskLevel: parsed.riskLevel || fallback.riskLevel,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallback.recommendations,
      requiresDoctor: typeof parsed.requiresDoctor === 'boolean' ? parsed.requiresDoctor : fallback.requiresDoctor,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  } catch (error) {
    logger.error('AI service call failed', { error: error.message });
    return fallback;
  }
}

/**
 * Generate intelligent health insights from comprehensive user context
 * Supports OpenAI completion with robust clinical fallback
 * @param {Object} context - Aggregated health context from aiContextService
 * @returns {Promise<Object>} Structured insights, risk assessment, and recommendations
 */
async function generateHealthInsights(context = {}) {
  const adherence = context?.medications?.adherence?.rate ?? 85;
  const abnormalVitals = context?.vitals?.abnormalVitalsCount || 0;
  const highRiskSymptoms = context?.symptomHistory?.recentHighRiskCount || 0;
  const abnormalReports = context?.clinicalHistory?.recentAbnormalReportsCount || 0;

  // Compute deterministic fallback insights
  const fallbackInsights = [];
  if (adherence >= 85) {
    fallbackInsights.push('Strong medication adherence supports ongoing condition stabilization.');
  } else {
    fallbackInsights.push(`Medication adherence currently at ${adherence}%. Timely dose intake is essential.`);
  }

  if (abnormalVitals > 0) {
    fallbackInsights.push(`${abnormalVitals} biometric vitals readings were outside standard baseline.`);
  } else {
    fallbackInsights.push('Resting vitals are consistent with baseline healthy parameters.');
  }

  if (highRiskSymptoms > 0) {
    fallbackInsights.push('Elevated symptom severity logged in recent assessment.');
  }

  if (abnormalReports > 0) {
    fallbackInsights.push('Recent laboratory reports detected values requiring physician review.');
  }

  const overallRiskLevel =
    highRiskSymptoms > 0 || abnormalReports > 1
      ? 'high'
      : abnormalVitals > 0 || adherence < 70
      ? 'medium'
      : 'low';

  const fallbackResult = {
    summary:
      overallRiskLevel === 'high'
        ? 'Clinical flags detected in recent health metrics requiring medical attention.'
        : 'Health metrics indicate generally stable day-to-day wellness management.',
    insights: fallbackInsights,
    riskLevel: overallRiskLevel,
    keyObservations: [
      `Active prescriptions: ${context?.medications?.activeCount || 0}`,
      `Medication adherence rate: ${adherence}%`,
      `Upcoming appointments: ${context?.clinicalHistory?.upcomingAppointments?.length || 0}`,
    ],
    recommendations: [
      adherence < 80 ? 'Set reminders to optimize adherence to prescribed schedule' : 'Maintain consistent dosing routines',
      overallRiskLevel !== 'low' ? 'Review symptoms with your healthcare provider' : 'Continue periodic health logging',
    ],
    disclaimer: MEDICAL_DISCLAIMER,
  };

  if (!client) {
    return fallbackResult;
  }

  try {
    const prompt = `
Analyze the following patient health context:
User: Age/Gender: ${context?.profile?.gender || 'N/A'}, BMI: ${context?.profile?.bmi || 'N/A'}
Chronic Conditions: ${(context?.profile?.chronicConditions || []).join(', ') || 'None'}
Medication Adherence: ${adherence}%
Vitals: BP: ${context?.vitals?.averageBloodPressure || 'N/A'}, HR: ${context?.vitals?.averageHeartRate || 'N/A'}
Recent High Risk Symptoms: ${highRiskSymptoms}
Recent Abnormal Reports: ${abnormalReports}

Instructions:
1. Provide a concise summary of health trajectory.
2. List 3 key insights.
3. Determine riskLevel ("low", "medium", "high", "critical").
4. Provide 3 actionable wellness recommendations.
5. NEVER provide a definitive medical diagnosis.
6. Return ONLY a valid JSON object:
{
  "summary": "string",
  "insights": ["string"],
  "riskLevel": "low|medium|high|critical",
  "keyObservations": ["string"],
  "recommendations": ["string"]
}
`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You are HealthSphere Clinical Intelligence AI. Provide safe, evidence-based wellness insights. Never diagnose disease.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const parsed = parseAssistantJSON(completion.choices?.[0]?.message?.content || '');
    if (!parsed) return fallbackResult;

    return {
      summary: parsed.summary || fallbackResult.summary,
      insights: Array.isArray(parsed.insights) && parsed.insights.length ? parsed.insights : fallbackResult.insights,
      riskLevel: ['low', 'medium', 'high', 'critical'].includes(parsed.riskLevel?.toLowerCase())
        ? parsed.riskLevel.toLowerCase()
        : fallbackResult.riskLevel,
      keyObservations: Array.isArray(parsed.keyObservations) ? parsed.keyObservations : fallbackResult.keyObservations,
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length
        ? parsed.recommendations
        : fallbackResult.recommendations,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  } catch (error) {
    logger.warn('AI insight generation failed, returning clinical fallback', { error: error.message });
    return fallbackResult;
  }
}

module.exports = {
  getAIHealthResponse,
  generateHealthInsights,
  MEDICAL_DISCLAIMER,
};
