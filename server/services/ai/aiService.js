const { generateGeminiText, safeParseJSON } = require('../gemini/geminiService');
const AIMemory = require('../../models/AIMemory');
const User = require('../../models/User');
const Report = require('../../models/Report');
const Medicine = require('../../models/Medicine');
const Appointment = require('../../models/Appointment');
const logger = require('../../utils/logger');

/**
 * Build rich patient clinical context for AI prompt
 */
async function buildUserContext(userId) {
  try {
    if (!userId) return 'No user ID provided. Assume general user context.';

    const [user, memory, reports, medicines, appointments] = await Promise.all([
      User.findById(userId).lean().catch(() => null),
      AIMemory.findOne({ userId }).lean().catch(() => null),
      Report.find({ userId }).sort({ createdAt: -1 }).limit(5).lean().catch(() => []),
      Medicine.find({ userId }).lean().catch(() => []),
      Appointment.find({ userId }).sort({ appointmentDate: -1 }).limit(5).lean().catch(() => []),
    ]);

    const profileStr = user
      ? `Name: ${user.name || 'Patient'}, Age: ${user.age || 'N/A'}, Gender: ${user.gender || 'N/A'}, Blood Group: ${user.bloodGroup || 'N/A'}`
      : 'General Patient';

    const allergies = memory?.longTermMemory?.allergies?.length
      ? memory.longTermMemory.allergies.join(', ')
      : user?.allergies?.length ? user.allergies.join(', ') : 'None documented';

    const medicinesStr = medicines?.length
      ? medicines.map((m) => `${m.name} (${m.dosage || 'as prescribed'})`).join(', ')
      : 'No active medications';

    const reportsStr = reports?.length
      ? reports.map((r) => `${r.title || 'Lab Report'} (${r.category || 'General'}) - ${r.summary || 'Uploaded'}`).join('; ')
      : 'No recent reports';

    const appointmentsStr = appointments?.length
      ? appointments.map((a) => `Appointment with Dr. ${a.doctorName || 'Specialist'} on ${a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : 'scheduled date'}`).join('; ')
      : 'No upcoming appointments';

    return `
PATIENT CLINICAL PROFILE:
- ${profileStr}
- Allergies: ${allergies}
- Active Medicines: ${medicinesStr}
- Recent Lab Reports: ${reportsStr}
- Scheduled Appointments: ${appointmentsStr}
`.trim();
  } catch (error) {
    logger.error('Error building user context', { error: error.message, userId });
    return 'Context retrieval degraded. Respond as a helpful healthcare assistant.';
  }
}

/**
 * Token Optimization & Context Pruning
 */
function optimizeChatHistory(chatHistory = [], maxMessages = 10) {
  return chatHistory.slice(-maxMessages).map((msg) => ({
    role: msg.sender === 'assistant' ? 'model' : 'user',
    text: msg.content.substring(0, 1000), // Max 1k chars per message token limit
  }));
}

/**
 * Prompt Builder
 */
function buildMedicalPrompt({ userContext, chatHistory, userPrompt }) {
  const historyText = chatHistory.length
    ? chatHistory.map((h) => `${h.role === 'model' ? 'AI Assistant' : 'User'}: ${h.text}`).join('\n')
    : 'No previous messages in this turn.';

  return `
SYSTEM DIRECTIVE:
You are HealthSphere AI, an empathetic, highly accurate clinical assistant.
Always emphasize that your insights are for informational support and advice, not a substitute for formal diagnosis.

${userContext}

RECENT CONVERSATION HISTORY:
${historyText}

CURRENT USER REQUEST:
${userPrompt}

RESPONSE REQUIREMENT:
Provide a clear, clinical yet accessible response. Format using Markdown (bullet points, bold text for key metrics/precautions).
Include 3 relevant suggested follow-up questions at the very end formatted as a JSON block:
\`\`\`json
{
  "suggestedFollowUps": ["Question 1", "Question 2", "Question 3"]
}
\`\`\`
`.trim();
}

/**
 * Handle AI Request with full context & memory update
 */
async function processAIRequest({ userId, userPrompt, chatHistory = [] }) {
  const startTime = Date.now();
  logger.info('Processing AI Request', { userId, promptLength: userPrompt.length });

  try {
    const userContext = await buildUserContext(userId);
    const optimizedHistory = optimizeChatHistory(chatHistory);
    const fullPrompt = buildMedicalPrompt({ userContext, chatHistory: optimizedHistory, userPrompt });

    const rawResponse = await generateGeminiText({
      prompt: fullPrompt,
      systemInstruction: 'You are HealthSphere AI, an advanced medical & wellness intelligence assistant.',
    });

    let answerText = rawResponse;
    let suggestedFollowUps = [
      'What lifestyle changes can help with this?',
      'When should I see a doctor regarding these symptoms?',
      'Are there potential drug interactions to watch out for?',
    ];

    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      const parsed = safeParseJSON(jsonMatch[1]);
      if (parsed?.suggestedFollowUps?.length) {
        suggestedFollowUps = parsed.suggestedFollowUps;
      }
      answerText = rawResponse.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
    }

    const duration = Date.now() - startTime;
    logger.info('AI Request Completed Successfully', { userId, durationMs: duration });

    return {
      text: answerText,
      suggestedFollowUps,
      tokensUsed: Math.ceil((fullPrompt.length + answerText.length) / 4),
    };
  } catch (error) {
    logger.error('AI Request Error', { error: error.message, userId });
    return {
      text: "I'm experiencing a momentary clinical processing issue. Please review your active health records or try asking your question again shortly.",
      suggestedFollowUps: [
        'How can I contact emergency services?',
        'Show my upcoming appointments',
        'Check active medications',
      ],
      tokensUsed: 0,
    };
  }
}

module.exports = {
  buildUserContext,
  optimizeChatHistory,
  buildMedicalPrompt,
  processAIRequest,
};
