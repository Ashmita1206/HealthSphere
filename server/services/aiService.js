const OpenAI = require("openai");
const { computeRiskFromText } = require("./riskEngine");
const { buildRecommendations } = require("./recommendationEngine");
const logger = require("../utils/logger");

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function parseAssistantJSON(text) {
  try {
    return JSON.parse(text);
  } catch (_e) {
    return null;
  }
}

async function getAIHealthResponse({ userMessage }) {
  const fallbackRisk = computeRiskFromText(userMessage);
  const fallback = {
    response: "I can help you understand your symptoms, but this is not a diagnosis. Please seek professional care if you feel unsafe.",
    riskLevel: fallbackRisk.riskLevel,
    recommendations: buildRecommendations(fallbackRisk),
    requiresDoctor: fallbackRisk.requiresDoctor
  };

  if (!client) return fallback;

  const systemPrompt =
    "You are HealthSphere AI, a cautious healthcare assistant. Return ONLY valid JSON with keys: response, riskLevel, recommendations, requiresDoctor. riskLevel must be one of low, medium, high, critical. Keep response concise and safety-first.";

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    });
    const text = completion.choices?.[0]?.message?.content || "";
    const parsed = parseAssistantJSON(text);
    if (!parsed) return fallback;
    return {
      response: parsed.response || fallback.response,
      riskLevel: parsed.riskLevel || fallback.riskLevel,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallback.recommendations,
      requiresDoctor: typeof parsed.requiresDoctor === "boolean" ? parsed.requiresDoctor : fallback.requiresDoctor
    };
  } catch (error) {
    logger.error("AI service call failed", { error: error.message });
    return fallback;
  }
}

module.exports = { getAIHealthResponse };
