const { generateGeminiText, safeParseJSON } = require('../gemini/geminiService');
const AIMemory = require('../../models/AIMemory');
const User = require('../../models/User');
const Report = require('../../models/Report');
const Medicine = require('../../models/Medicine');
const Appointment = require('../../models/Appointment');
const HealthScore = require('../../models/HealthScore');
const ChatSession = require('../../models/ChatSession');
const logger = require('../../utils/logger');

/**
 * 1. EMERGENCY DETECTION
 */
const EMERGENCY_KEYWORDS = [
  'chest pain', 'pressure in chest', 'stroke', 'numbness on one side',
  'heart attack', 'heavy bleeding', 'uncontrolled bleeding',
  'difficulty breathing', 'shortness of breath', 'gasping',
  'suicidal', 'want to die', 'end my life', 'harm myself',
  'severe burn', 'third degree burn', 'high fever with confusion',
  'loss of consciousness', 'fainted and unreactive', 'anaphylaxis'
];

function detectEmergency(text = '') {
  const lower = text.toLowerCase();
  const matched = EMERGENCY_KEYWORDS.find((keyword) => lower.includes(keyword));
  if (matched) {
    return {
      isEmergency: true,
      matchedKeyword: matched,
      warning: `🚨 CRITICAL EMERGENCY ALERT DETECTED: You mentioned "${matched}". If this is a life-threatening medical emergency, please do NOT wait for AI advice. Contact local emergency medical services immediately!`,
      numbers: ['911 (US/Global standard)', '112 (EU/International)', '102 / 108 (India)'],
      hospitalsApiRecommended: true,
    };
  }
  return { isEmergency: false };
}

/**
 * 2. RESPONSE MODE CLASSIFICATION
 */
function classifyMode(userPrompt = '') {
  const lower = userPrompt.toLowerCase();
  if (detectEmergency(userPrompt).isEmergency) return 'Emergency';
  if (/hi|hello|hey|good morning|good evening/i.test(lower) && lower.length < 20) return 'Greeting';
  if (/dose|dosage|medication|pill|tablet|prescription|side effect|metformin|aspirin|statin/i.test(lower)) return 'Medicine';
  if (/blood test|lab report|cbc|lipid|mri|ct scan|x-ray|biomarker|ocr/i.test(lower)) return 'Reports';
  if (/diet|food|calories|protein|meal|nutrition|vitamin|sodium|keto|dash/i.test(lower)) return 'Nutrition';
  if (/workout|exercise|gym|cardio|steps|running|stretching|physio/i.test(lower)) return 'Exercise';
  if (/anxiety|stress|depressed|mental|sleep|insomnia|mood|mindfulness/i.test(lower)) return 'Mental Health';
  if (/pain|fever|symptom|swelling|cough|dizzy|nausea|headache|rash|vomit/i.test(lower)) return 'Medical Advice';
  return 'General Chat';
}

/**
 * 3. PERSONAL HEALTH CONTEXT ENGINE
 */
async function buildUserContext(userId) {
  try {
    if (!userId) return 'No user ID provided. Assume general user context.';

    const [user, memory, reports, medicines, appointments, healthScore] = await Promise.all([
      User.findById(userId).lean().catch(() => null),
      AIMemory.findOne({ userId }).lean().catch(() => null),
      Report.find({ userId }).sort({ createdAt: -1 }).limit(3).lean().catch(() => []),
      Medicine.find({ userId }).lean().catch(() => []),
      Appointment.find({ userId }).sort({ appointmentDate: -1 }).limit(3).lean().catch(() => []),
      HealthScore.findOne({ userId }).sort({ createdAt: -1 }).lean().catch(() => null),
    ]);

    const profileStr = user
      ? `Name: ${user.name || 'Patient'}, Age: ${user.age || 'N/A'}, Gender: ${user.gender || 'N/A'}, Blood Type: ${user.bloodType || 'N/A'}`
      : 'General Patient';

    const allergies = memory?.longTermMemory?.allergies?.length
      ? memory.longTermMemory.allergies.join(', ')
      : user?.medicalHistory?.length ? user.medicalHistory.join(', ') : 'None documented';

    const recurringSymptoms = memory?.longTermMemory?.recurringSymptoms?.length
      ? memory.longTermMemory.recurringSymptoms.join(', ')
      : 'None tracked';

    const medicinesStr = medicines?.length
      ? medicines.map((m) => `${m.name} (${m.dosage || 'as prescribed'})`).join(', ')
      : 'No active medications';

    const reportsStr = reports?.length
      ? reports.map((r) => `${r.title || 'Lab Report'} (${r.category || 'General'})`).join('; ')
      : 'No recent lab reports';

    const scoreStr = healthScore
      ? `Overall Health Score: ${healthScore.overallHealthScore}/100`
      : 'Health Score: 75/100 (Default)';

    const appointmentsStr = appointments?.length
      ? appointments.map((a) => `Dr. ${a.doctorName || 'Specialist'} on ${a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : 'scheduled date'}`).join('; ')
      : 'No upcoming appointments';

    return `
PATIENT CLINICAL PROFILE & HISTORY:
- ${profileStr}
- Vitals / Health Score: ${scoreStr}
- Known Allergies & Conditions: ${allergies}
- Tracked Recurring Symptoms: ${recurringSymptoms}
- Active Medicines: ${medicinesStr}
- Recent Reports: ${reportsStr}
- Upcoming Appointments: ${appointmentsStr}
- Preferred Language: ${memory?.longTermMemory?.preferredLanguage || 'English'}
`.trim();
  } catch (error) {
    logger.error('Error building user context', { error: error.message, userId });
    return 'Context retrieval degraded. Respond as a helpful healthcare assistant.';
  }
}

/**
 * 4. TOKEN OPTIMIZATION & HISTORY PRUNING
 */
function optimizeChatHistory(chatHistory = [], maxMessages = 6) {
  return chatHistory.slice(-maxMessages).map((msg) => ({
    role: msg.sender === 'assistant' ? 'model' : 'user',
    text: msg.content.substring(0, 800), // Max 800 chars to save tokens
  }));
}

/**
 * 5. SMART MEMORY AUTO-EXTRACTION & PERSISTENCE
 */
async function updateSmartMemory(userId, userPrompt, assistantText) {
  try {
    if (!userId) return;
    const lowerPrompt = userPrompt.toLowerCase();

    // Quick regex pattern matching to extract key insights without calling LLM every single turn
    let memoryDoc = await AIMemory.findOne({ userId });
    if (!memoryDoc) {
      memoryDoc = new AIMemory({ userId, longTermMemory: {} });
    }

    let modified = false;

    // Detect allergy mention
    const allergyMatch = userPrompt.match(/allergic to ([a-zA-Z0-9\s,]+)/i);
    if (allergyMatch && allergyMatch[1]) {
      const item = allergyMatch[1].trim();
      if (!memoryDoc.longTermMemory.allergies.includes(item)) {
        memoryDoc.longTermMemory.allergies.push(item);
        modified = true;
      }
    }

    // Detect recurring symptom
    const symptomMatch = userPrompt.match(/(frequently|always|recurring|keep getting|often) (suffer from|have|get) ([a-zA-Z\s]+)/i);
    if (symptomMatch && symptomMatch[3]) {
      const sym = symptomMatch[3].trim();
      if (!memoryDoc.longTermMemory.recurringSymptoms.includes(sym)) {
        memoryDoc.longTermMemory.recurringSymptoms.push(sym);
        modified = true;
      }
    }

    if (modified) {
      await memoryDoc.save();
      logger.info('Smart Memory updated for user', { userId });
    }
  } catch (err) {
    logger.warn('Failed to update smart memory', { error: err.message, userId });
  }
}

/**
 * 6. DYNAMIC PROMPT BUILDER
 */
function buildMedicalPrompt({ userContext, chatHistory, userPrompt, mode, emergency }) {
  const historyText = chatHistory.length
    ? chatHistory.map((h) => `${h.role === 'model' ? 'AI Assistant' : 'User'}: ${h.text}`).join('\n')
    : 'No previous turn history.';

  let modeInstruction = '';
  switch (mode) {
    case 'Medical Advice':
      modeInstruction = 'Mode: Medical Advice. Assess symptoms carefully. Ask follow-up questions if duration, severity, or exact location are missing.';
      break;
    case 'Medicine':
      modeInstruction = 'Mode: Medication Triage. Provide clear dosing cautions, meal timing advice, and warn against altering prescription without doctor approval.';
      break;
    case 'Emergency':
      modeInstruction = 'Mode: EMERGENCY ALERT. Prioritize patient safety immediately. Urge contacting emergency services or visiting nearest hospital.';
      break;
    case 'Nutrition':
      modeInstruction = 'Mode: Clinical Nutrition. Focus on evidence-based dietary recommendations, hydration, and sodium/sugar restrictions.';
      break;
    case 'Exercise':
      modeInstruction = 'Mode: Physical Activity. Recommend safe, low-impact or progressive exercises based on user profile.';
      break;
    case 'Mental Health':
      modeInstruction = 'Mode: Mental Health Support. Provide compassionate, supportive guidance and stress reduction strategies.';
      break;
    case 'Reports':
      modeInstruction = 'Mode: Lab & Diagnostic Interpretation. Explain reference ranges, flag elevated metrics, and recommend doctor follow-up.';
      break;
    default:
      modeInstruction = 'Mode: General Health Consultation. Provide clear, helpful medical assistance.';
  }

  return `
SYSTEM DIRECTIVE:
You are HealthSphere AI, an empathetic, highly accurate clinical assistant.
Always emphasize that your insights are for informational support, not a substitute for formal clinical diagnosis.

${modeInstruction}

${userContext}

RECENT CONVERSATION HISTORY:
${historyText}

CURRENT USER REQUEST:
${userPrompt}

RESPONSE STRUCTURE INSTRUCTIONS:
1. If the user presents vague or incomplete symptoms (e.g. "I have stomach pain"), FIRST ask 3-4 targeted clinical follow-up questions (Location? Duration? Pain scale 1-10? Fever/Vomiting?) before giving definitive advice.
2. Formulate your clinical answer clearly in Markdown.
3. At the very end, append a JSON block containing metadata:
\`\`\`json
{
  "confidenceScore": 0.92,
  "suggestedFollowUps": ["Question 1", "Question 2", "Question 3"],
  "smartRecommendations": {
    "relatedQuestions": ["Related Q1", "Related Q2"],
    "lifestyleTips": ["Tip 1"],
    "medicineReminder": "Optional reminder suggestion",
    "waterReminder": "Drink 500ml water now",
    "exerciseSuggestion": "Light 15 min walk",
    "dietSuggestion": "Low sodium balanced meal"
  }
}
\`\`\`
`.trim();
}

/**
 * 7. CONVERSATION SUMMARIZATION ENGINE
 */
async function summarizeConversation(sessionId) {
  try {
    const session = await ChatSession.findById(sessionId);
    if (!session) return;

    const messages = await require('../../models/ChatMessage').find({ sessionId }).sort({ createdAt: 1 });
    if (messages.length < 4) return; // Only summarize conversations with at least 4 turns

    const convoText = messages.map((m) => `${m.sender}: ${m.content}`).join('\n');
    const prompt = `
Summarize the following clinical conversation into key medical insights:
${convoText}

Return JSON with exact keys:
{
  "summary": "Brief 2-sentence summary of the user's issue and advice given",
  "importantSymptoms": ["Symptom 1"],
  "medicinesMentioned": ["Medicine 1"],
  "reportsDiscussed": ["Report 1"],
  "suggestedNextSteps": ["Step 1"]
}
`;

    const raw = await generateGeminiText({ prompt, temperature: 0.1 });
    const parsed = safeParseJSON(raw);
    if (parsed && parsed.summary) {
      session.summary = {
        text: parsed.summary,
        importantSymptoms: parsed.importantSymptoms || [],
        medicinesMentioned: parsed.medicinesMentioned || [],
        reportsDiscussed: parsed.reportsDiscussed || [],
        suggestedNextSteps: parsed.suggestedNextSteps || [],
        updatedAt: new Date(),
      };
      await session.save();
      logger.info('Conversation summarized successfully', { sessionId });
    }
  } catch (err) {
    logger.warn('Summarize conversation error', { error: err.message, sessionId });
  }
}

/**
 * 8. MAIN PROCESS AI REQUEST ENGINE
 */
async function processAIRequest({ userId, userPrompt, chatHistory = [], sessionId = null }) {
  const startTime = Date.now();

  // Emergency Check
  const emergencyInfo = detectEmergency(userPrompt);
  const mode = classifyMode(userPrompt);

  logger.info('AI Observability: Request Started', {
    userId,
    mode,
    isEmergency: emergencyInfo.isEmergency,
    promptLength: userPrompt.length,
  });

  try {
    const userContext = await buildUserContext(userId);
    const optimizedHistory = optimizeChatHistory(chatHistory);
    const fullPrompt = buildMedicalPrompt({
      userContext,
      chatHistory: optimizedHistory,
      userPrompt,
      mode,
      emergency: emergencyInfo,
    });

    const rawResponse = await generateGeminiText({
      prompt: fullPrompt,
      systemInstruction: 'You are HealthSphere AI, an advanced medical intelligence assistant.',
    });

    let answerText = rawResponse;
    let confidenceScore = emergencyInfo.isEmergency ? 0.99 : 0.90;
    let suggestedFollowUps = [
      'What symptoms require immediate emergency care?',
      'When should I schedule a follow-up appointment?',
      'Are there specific food or drug interactions?',
    ];
    let smartRecommendations = {
      relatedQuestions: ['How can I track my vitals daily?'],
      lifestyleTips: ['Maintain consistent sleep schedules'],
      waterReminder: 'Keep hydrated throughout the day',
      exerciseSuggestion: 'Take a mild 20-minute daily walk',
      dietSuggestion: 'Eat balanced fiber-rich meals',
    };

    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      const parsed = safeParseJSON(jsonMatch[1]);
      if (parsed) {
        if (parsed.confidenceScore) confidenceScore = parsed.confidenceScore;
        if (parsed.suggestedFollowUps?.length) suggestedFollowUps = parsed.suggestedFollowUps;
        if (parsed.smartRecommendations) smartRecommendations = { ...smartRecommendations, ...parsed.smartRecommendations };
      }
      answerText = rawResponse.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
    }

    // Emergency prepending if emergency detected
    if (emergencyInfo.isEmergency) {
      answerText = `${emergencyInfo.warning}\n\n${answerText}`;
    }

    const duration = Date.now() - startTime;
    const estimatedTokens = Math.ceil((fullPrompt.length + answerText.length) / 4);

    // AI Observability Logging
    logger.info('AI Observability: Request Completed', {
      userId,
      mode,
      durationMs: duration,
      promptLength: fullPrompt.length,
      responseLength: answerText.length,
      estimatedTokens,
      confidenceScore,
    });

    // Background tasks: Update smart memory & conversation summary
    updateSmartMemory(userId, userPrompt, answerText).catch(() => {});
    if (sessionId) {
      summarizeConversation(sessionId).catch(() => {});
    }

    return {
      text: answerText,
      mode,
      confidenceScore,
      isEmergency: emergencyInfo.isEmergency,
      emergencyData: emergencyInfo.isEmergency ? emergencyInfo : null,
      suggestedFollowUps,
      smartRecommendations,
      tokensUsed: estimatedTokens,
      latencyMs: duration,
    };
  } catch (error) {
    logger.error('AI Observability: Request Failed', { error: error.message, userId });
    return {
      text: "I'm experiencing a temporary clinical processing hiccup. If this is urgent, please consult your primary physician or nearest emergency clinic immediately.",
      mode: 'General Chat',
      confidenceScore: 0.5,
      isEmergency: emergencyInfo.isEmergency,
      suggestedFollowUps: ['Show emergency contacts', 'Check my active medications'],
      smartRecommendations: {
        relatedQuestions: [],
        lifestyleTips: ['Rest and hydrate'],
      },
      tokensUsed: 0,
      latencyMs: Date.now() - startTime,
    };
  }
}

module.exports = {
  detectEmergency,
  classifyMode,
  buildUserContext,
  optimizeChatHistory,
  buildMedicalPrompt,
  processAIRequest,
  summarizeConversation,
};

