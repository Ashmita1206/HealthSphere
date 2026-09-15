const mongoose = require('mongoose');
const AssistantConversation = require('../models/AssistantConversation');
const aiContextService = require('./aiContextService');
const notificationService = require('./notificationService');
const timelineService = require('./timelineService');
const logger = require('../utils/logger');

// In-memory conversation fallback for disconnected environments
const sessionMemoryStore = new Map();

/**
 * Emergency keyword sets across supported languages
 */
const EMERGENCY_KEYWORDS = {
  en: ['emergency', 'help me', 'heart attack', "can't breathe", 'cannot breathe', 'chest pain', 'call ambulance', 'severe pain', 'stroke', 'unconscious'],
  hi: ['bachao', 'madad', 'chhati me dard', 'dil me dard', 'saans lene me takleef', 'heart attack', 'ambulance', 'behosh', 'aapatkaal', 'emergency'],
  pa: ['bachao', 'madad', 'chhati vich dard', 'dil da daura', 'saah nahi aa reha', 'ambulance', 'behosh', 'emergency'],
  hinglish: ['bachao', 'help', 'chest pain', 'heart attack', 'saans nahi aa rahi', 'chhati dard', 'ambulance bulao'],
};

/**
 * Detect emergency commands across languages
 */
function detectEmergencyCommand(text = '', language = 'en') {
  const lower = text.toLowerCase().trim();
  const allKeywords = [
    ...(EMERGENCY_KEYWORDS[language] || []),
    ...EMERGENCY_KEYWORDS.en,
    ...EMERGENCY_KEYWORDS.hi,
    ...EMERGENCY_KEYWORDS.pa,
    ...EMERGENCY_KEYWORDS.hinglish,
  ];

  for (const kw of allKeywords) {
    if (lower.includes(kw)) {
      return {
        isEmergency: true,
        matchedKeyword: kw,
      };
    }
  }

  return { isEmergency: false };
}

/**
 * Classify conversation intent
 */
function classifyIntent(text = '') {
  const lower = text.toLowerCase();

  // 1. Medicine
  if (
    lower.includes('medicine') ||
    lower.includes('dawai') ||
    lower.includes('dawao') ||
    lower.includes('dawa') ||
    lower.includes('goli') ||
    lower.includes('dose') ||
    lower.includes('prescription') ||
    lower.includes('khurak') ||
    lower.includes('timing') ||
    lower.includes('दवाई') ||
    lower.includes('दवा') ||
    lower.includes('गोली') ||
    lower.includes('ਦਵਾਈ') ||
    lower.includes('ਗੋਲੀ') ||
    lower.includes('ਖੁਰਾਕ')
  ) {
    return 'medicine';
  }

  // 2. Appointment
  if (
    lower.includes('appointment') ||
    lower.includes('doctor') ||
    lower.includes('consultation') ||
    lower.includes('mulaqat') ||
    lower.includes('visit') ||
    lower.includes('clinic') ||
    lower.includes('hospital') ||
    lower.includes('अपॉइंटमेंट') ||
    lower.includes('डॉक्टर') ||
    lower.includes('मुलाकात') ||
    lower.includes('अਪਾਇੰਟਮੈਂਟ') ||
    lower.includes('ਅਪਾਇੰਟਮੈਂਟ') ||
    lower.includes('ਡਾਕਟਰ') ||
    lower.includes('ਮੁਲਾਕਾਤ') ||
    lower.includes('ਹਸਪਤਾਲ')
  ) {
    return 'appointment';
  }

  // 3. Reports & OCR
  if (
    lower.includes('report') ||
    lower.includes('ocr') ||
    lower.includes('blood test') ||
    lower.includes('lab') ||
    lower.includes('scan') ||
    lower.includes('cbc') ||
    lower.includes('sugar report') ||
    lower.includes('jaanch') ||
    lower.includes('रिपोर्ट') ||
    lower.includes('जांच') ||
    lower.includes('ਰਿਪੋਰਟ') ||
    lower.includes('ਜਾਂਚ')
  ) {
    return 'report';
  }

  // 4. Timeline
  if (
    lower.includes('timeline') ||
    lower.includes('history') ||
    lower.includes('kya hua tha') ||
    lower.includes('past') ||
    lower.includes('events') ||
    lower.includes('pehle') ||
    lower.includes('record') ||
    lower.includes('टाइमलाइन') ||
    lower.includes('इतिहास') ||
    lower.includes('ਟਾਈਮਲਾਈਨ') ||
    lower.includes('ਇਤਿਹਾਸ')
  ) {
    return 'timeline';
  }

  return 'general';
}

/**
 * Synthesize Speech (Text-to-Speech abstraction)
 */
function synthesizeSpeech(text, language = 'en') {
  const voiceProfiles = {
    en: { voiceName: 'en-IN-Wavenet-B', pitch: 0.0, speakingRate: 1.0 },
    hi: { voiceName: 'hi-IN-Wavenet-A', pitch: 0.1, speakingRate: 0.95 },
    pa: { voiceName: 'pa-IN-Wavenet-A', pitch: 0.0, speakingRate: 0.95 },
    hinglish: { voiceName: 'hi-IN-Neural2-C', pitch: 0.0, speakingRate: 1.0 },
  };

  const profile = voiceProfiles[language] || voiceProfiles.en;

  // Generate lightweight base64 audio stub for browser playback
  const mockAudioBase64 = Buffer.from(`HEALTHSPHERE_TTS_STREAM_${language.toUpperCase()}_${text.slice(0, 40)}`).toString('base64');

  return {
    language,
    audioFormat: 'audio/mp3',
    voiceName: profile.voiceName,
    speakingRate: profile.speakingRate,
    audioContent: mockAudioBase64,
    phoneticGuide: text.slice(0, 100),
  };
}

/**
 * Domain-specific response generator with multilingual phrasing
 */
async function generateAssistantReply(userId, intent, message, language = 'en', userContext = null) {
  let ctx = userContext;
  if (!ctx) {
    try {
      ctx = await aiContextService.getUserHealthContext(userId);
    } catch {
      ctx = {};
    }
  }

  const patientName = ctx.user?.name || (language === 'hi' ? 'स्वास्थ्य मित्र' : language === 'pa' ? 'ਸਿਹਤ ਮਿੱਤਰ' : 'Health Friend');

  switch (intent) {
    case 'medicine': {
      const meds = ctx.medicines?.list || [];
      const adherence = ctx.adherence?.rate ?? 85;

      if (language === 'hi') {
        const medListStr = meds.length
          ? meds.map((m) => `${m.name} (${m.dosage || 'नियमित मात्रा'}, ${m.timing || 'समय पर'})`).join(', ')
          : 'फिलहाल कोई सक्रिय दवाई दर्ज नहीं है।';
        return `नमस्ते ${patientName}, आपकी वर्तमान दवाइयां हैं: ${medListStr}। आपकी दवा अनुपालन दर (Adherence) ${adherence}% है। समय पर दवा लेना न भूलें!`;
      }

      if (language === 'pa') {
        const medListStr = meds.length
          ? meds.map((m) => `${m.name} (${m.dosage || 'ਨਿਯਮਿਤ ਖੁਰਾਕ'})`).join(', ')
          : 'ਇਸ ਸਮੇਂ ਕੋਈ ਦਵਾਈ ਦਰਜ ਨਹੀਂ ਹੈ।';
        return `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${patientName}, ਤੁਹਾਡੀਆਂ ਦਵਾਈਆਂ: ${medListStr}। ਤੁਹਾਡੀ ਦਵਾਈਆਂ ਲੈਣ ਦੀ ਦਰ ${adherence}% ਹੈ। ਸਿਹਤ ਦਾ ਧਿਆਨ ਰੱਖੋ!`;
      }

      if (language === 'hinglish') {
        const medListStr = meds.length
          ? meds.map((m) => `${m.name} (${m.dosage || 'dosage'})`).join(', ')
          : 'Abhi koi active dawai list me nahi hai.';
        return `Hello ${patientName}, aapki current medicines hain: ${medListStr}. Aapka adherence rate ${adherence}% hai. Please time pe lein!`;
      }

      // Default English
      const medListStr = meds.length
        ? meds.map((m) => `${m.name} (${m.dosage || 'Standard dose'}, ${m.timing || 'Daily'})`).join(', ')
        : 'No active medications currently registered.';
      return `Hello ${patientName}, your active prescriptions are: ${medListStr}. Your adherence rate is ${adherence}%. Take your doses on time for best outcomes.`;
    }

    case 'appointment': {
      const nextAppt = ctx.upcomingAppointments?.next;

      if (language === 'hi') {
        if (!nextAppt) return `नमस्ते ${patientName}, आपकी आने वाले दिनों में कोई डॉक्टर अपॉइंटमेंट निर्धारित नहीं है।`;
        return `नमस्ते ${patientName}, आपकी अगली अपॉइंटमेंट ${nextAppt.doctorName || 'डॉक्टर'} के साथ ${new Date(nextAppt.date).toLocaleDateString()} को है (${nextAppt.hospital || 'क्लिनिक'})।`;
      }

      if (language === 'pa') {
        if (!nextAppt) return `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${patientName}, ਤੁਹਾਡੀ ਕੋਈ ਅਗਲੀ ਡਾਕਟਰ ਅਪਾਇੰਟਮੈਂਟ ਨਹੀਂ ਹੈ।`;
        return `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${patientName}, ਤੁਹਾਡੀ ਅਗਲੀ ਮੁਲਾਕਾਤ ਡਾ. ${nextAppt.doctorName || 'ਡਾਕਟਰ'} ਨਾਲ ਹੈ (${nextAppt.hospital || 'ਕਲੀਨਿਕ'})।`;
      }

      // English
      if (!nextAppt) return `Hello ${patientName}, you have no upcoming doctor appointments scheduled at this time.`;
      return `Hello ${patientName}, your next consultation is with Dr. ${nextAppt.doctorName || 'Assigned Physician'} on ${new Date(nextAppt.date).toLocaleDateString()} at ${nextAppt.hospital || 'HealthSphere Clinic'}.`;
    }

    case 'report': {
      const reports = ctx.recentReports?.recent || [];
      const latestReport = reports[0];

      if (language === 'hi') {
        if (!latestReport) return `नमस्ते ${patientName}, आपकी मेडिकल प्रोफाइल में अभी कोई नया लैब या ओसीआर रिपोर्ट उपलब्ध नहीं है।`;
        return `नमस्ते ${patientName}, आपकी नवीनतम रिपोर्ट '${latestReport.title}' का जोखिम स्तर '${latestReport.riskLevel || 'सामान्य'}' है। सारांश: ${latestReport.summary || 'पैरामीटर्स स्थिर हैं।'}`;
      }

      if (language === 'pa') {
        if (!latestReport) return `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${patientName}, ਤੁਹਾਡੀ ਕੋਈ ਨਵੀਂ ਰਿਪੋਰਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।`;
        return `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${patientName}, ਤੁਹਾਡੀ ਰਿਪੋਰਟ '${latestReport.title}' ਦਾ ਰਿਸਕ ਲੈਵਲ '${latestReport.riskLevel || 'ਆਮ'}' ਹੈ।`;
      }

      // English
      if (!latestReport) return `Hello ${patientName}, no recent medical diagnostic reports or OCR scans were found.`;
      return `Hello ${patientName}, your latest diagnostic report '${latestReport.title}' is classified as ${latestReport.riskLevel || 'Normal'} risk. Summary: ${latestReport.summary || 'Vitals and chemistry appear within expected ranges.'}`;
    }

    case 'timeline': {
      const timeline = ctx.recentTimeline || [];

      if (language === 'hi') {
        if (!timeline.length) return `नमस्ते ${patientName}, हाल ही में कोई खास स्वास्थ्य घटना दर्ज नहीं हुई है।`;
        const lastEvent = timeline[0];
        return `नमस्ते ${patientName}, आपकी हालिया स्वास्थ्य टाइमलाइन घटना: '${lastEvent.title}' - ${lastEvent.description}।`;
      }

      if (language === 'pa') {
        if (!timeline.length) return `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${patientName}, ਪਿਛਲੇ ਕੁਝ ਸਮੇਂ ਵਿੱਚ ਕੋਈ ਘਟਨਾ ਦਰਜ ਨਹੀਂ ਹੈ।`;
        return `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${patientName}, ਤੁਹਾਡੀ ਤਾਜ਼ਾ ਟਾਈਮਲਾਈਨ ਘਟਨਾ: '${timeline[0].title}'।`;
      }

      // English
      if (!timeline.length) return `Hello ${patientName}, no recent health timeline events recorded.`;
      return `Hello ${patientName}, your most recent timeline event is '${timeline[0].title}': ${timeline[0].description}.`;
    }

    default: {
      if (language === 'hi') {
        return `नमस्ते ${patientName}! मैं आपका हेल्थस्फीयर बहुभाषी एआई स्वास्थ्य सहायक हूँ। आप मुझसे अपनी दवाइयों, रिपोर्ट, डॉक्टर अपॉइंटमेंट या लक्षणों के बारे में पूछ सकते हैं।`;
      }
      if (language === 'pa') {
        return `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${patientName}! ਮੈਂ ਤੁਹਾਡਾ ਹੈਲਥਸਫੀਅਰ ਏਆਈ ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਦਵਾਈਆਂ, ਟੈਸਟ ਰਿਪੋਰਟਾਂ ਜਾਂ ਮੁਲਾਕਾਤਾਂ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।`;
      }
      if (language === 'hinglish') {
        return `Hello ${patientName}! Main aapka HealthSphere AI Assistant hoon. Aap mujhse medicines, reports, appointments ya symptoms ke baare me pooch sakte hain.`;
      }

      return `Hello ${patientName}! I am your HealthSphere AI Multilingual Health Assistant. You can ask me about your prescriptions, lab test reports, upcoming appointments, or general health insights.`;
    }
  }
}

/**
 * Process Chat Message with Multilingual & Emergency Support
 */
async function processChatMessage(userId, payload = {}) {
  const { sessionId = `session-${Date.now()}`, message = '', language = 'en', inputType = 'text' } = payload;

  if (!message || !message.trim()) {
    throw new Error('message content is required');
  }

  // 1. Check for Emergency voice/text trigger
  const emergencyCheck = detectEmergencyCommand(message, language);

  let reply = '';
  let domain = 'general';
  let isEmergency = emergencyCheck.isEmergency;

  if (isEmergency) {
    domain = 'emergency';

    // Emergency escalation
    await notificationService.createNotification({
      userId,
      title: language === 'hi' ? 'आपातकालीन अलर्ट' : language === 'pa' ? 'ਐਮਰਜੈਂਸੀ ਅਲਰਟ' : 'Emergency Assistance Alert',
      message: `Emergency keyword detected in assistant session: "${emergencyCheck.matchedKeyword}". Dispatching alerts.`,
      type: 'emergency',
      severity: 'critical',
      priority: 'high',
      route: '/emergency',
    });

    await timelineService.createEvent({
      userId,
      eventType: 'emergency',
      category: 'emergency',
      title: 'Emergency Voice Triggered',
      description: `User triggered emergency command "${message}" via ${inputType}.`,
    });

    if (language === 'hi') {
      reply = '⚠️ आपातकालीन अलर्ट ट्रिगर हो गया है! कृपया तुरंत 108 या 112 पर कॉल करें। शांत बैठें, हमने आपके इमरजेंसी संपर्कों को सूचित कर दिया है।';
    } else if (language === 'pa') {
      reply = '⚠️ ਐਮਰਜੈਂਸੀ ਅਲਰਟ ਸ਼ੁਰੂ ਹੋ ਗਿਆ ਹੈ! ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ 108 ਜਾਂ 112 ਤੇ ਕਾਲ ਕਰੋ। ਅਸੀਂ ਤੁਹਾਡੇ ਸੰਪਰਕਾਂ ਨੂੰ ਸੂਚਿਤ ਕਰ ਦਿੱਤਾ ਹੈ।';
    } else {
      reply = '⚠️ Emergency protocol activated! Call emergency services (911/112/108) immediately. Stay calm, sit down, and help is being alerted.';
    }
  } else {
    // Classify non-emergency intent
    domain = classifyIntent(message);
    reply = await generateAssistantReply(userId, domain, message, language);
  }

  // 2. Synthesize audio output (TTS)
  const audioOutput = synthesizeSpeech(reply, language);

  // 3. Persist to Conversation Memory
  const userMsg = { role: 'user', content: message, inputType, timestamp: new Date() };
  const assistantMsg = { role: 'assistant', content: reply, inputType: 'text', timestamp: new Date() };

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      await AssistantConversation.findOneAndUpdate(
        { userId, sessionId },
        {
          $setOnInsert: { userId, sessionId, language },
          $push: { messages: { $each: [userMsg, assistantMsg] } },
          $set: { lastInteraction: new Date(), language },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      logger.warn('Failed to persist assistant conversation to MongoDB', { error: err.message });
    }
  } else {
    const existing = sessionMemoryStore.get(sessionId) || [];
    existing.push(userMsg, assistantMsg);
    sessionMemoryStore.set(sessionId, existing);
  }

  return {
    sessionId,
    language,
    domain,
    isEmergency,
    message,
    reply,
    audioOutput,
  };
}

/**
 * Process Voice Message (STT Transcription + Processing + TTS Response)
 */
async function processVoiceMessage(userId, payload = {}) {
  const { sessionId, audioData, transcript, language = 'en' } = payload;

  // Speech-to-Text abstraction
  let extractedTranscript = transcript;
  if (!extractedTranscript && audioData) {
    // Decode base64 STT payload representation
    try {
      const decoded = Buffer.from(audioData, 'base64').toString('utf-8');
      extractedTranscript = decoded.replace(/^HEALTHSPHERE_VOICE_STREAM_/, '').trim() || 'Help me with my health';
    } catch {
      extractedTranscript = 'Help me with my health';
    }
  }

  if (!extractedTranscript) {
    extractedTranscript = 'What are my medicines today?';
  }

  return await processChatMessage(userId, {
    sessionId,
    message: extractedTranscript,
    language,
    inputType: 'voice',
  });
}

/**
 * Retrieve conversation history
 */
async function getConversationHistory(userId, sessionId) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const convo = await AssistantConversation.findOne({ userId, sessionId }).lean();
    return convo?.messages || [];
  }

  return sessionMemoryStore.get(sessionId) || [];
}

module.exports = {
  detectEmergencyCommand,
  classifyIntent,
  synthesizeSpeech,
  generateAssistantReply,
  processChatMessage,
  processVoiceMessage,
  getConversationHistory,
};
