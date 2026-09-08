import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
const assistantService = req('../../server/services/assistantService');
const assistantController = req('../../server/controllers/assistantController');
const aiContextService = req('../../server/services/aiContextService');
const notificationService = require('../../server/services/notificationService');
const timelineService = require('../../server/services/timelineService');

describe('F23 — Multilingual Voice Healthcare Assistant Backend Suite', () => {
  const patientUserId = '64b1f77bcf86cd7994390001';

  const mockUserHealthContext = {
    user: { name: 'Aarav Sharma', bloodType: 'B+' },
    medicines: {
      activeCount: 2,
      list: [
        { name: 'Metformin', dosage: '500mg', timing: 'Morning after meals' },
        { name: 'Telmisartan', dosage: '40mg', timing: 'Night' },
      ],
    },
    adherence: { rate: 88, status: 'High Adherence' },
    upcomingAppointments: {
      count: 1,
      next: {
        doctorName: 'Dr. Neha Verma',
        hospital: 'Apollo Heart Institute',
        date: new Date('2026-09-15T10:00:00.000Z'),
      },
    },
    recentReports: {
      count: 1,
      recent: [
        {
          title: 'Comprehensive Lipid Profile',
          category: 'Blood Chemistry',
          riskLevel: 'moderate',
          summary: 'Elevated total cholesterol and LDL, borderline triglycerides.',
        },
      ],
    },
    recentTimeline: [
      {
        eventType: 'medicine',
        title: 'Morning Dose Completed',
        description: 'Metformin 500mg logged on schedule.',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(aiContextService, 'getUserHealthContext').mockResolvedValue(mockUserHealthContext);
  });

  it('1. detectEmergencyCommand identifies crisis keywords in English, Hindi, and Punjabi', () => {
    // English
    const enRes = assistantService.detectEmergencyCommand('Emergency! Call an ambulance now', 'en');
    expect(enRes.isEmergency).toBe(true);

    // Hindi
    const hiRes = assistantService.detectEmergencyCommand('Bachao! Chhati me dard ho raha hai', 'hi');
    expect(hiRes.isEmergency).toBe(true);
    expect(hiRes.matchedKeyword).toBe('bachao');

    // Punjabi
    const paRes = assistantService.detectEmergencyCommand('Meri madad karo, dil da daura pe gaya hai', 'pa');
    expect(paRes.isEmergency).toBe(true);

    // Normal non-emergency
    const normalRes = assistantService.detectEmergencyCommand('What time should I take my vitamins?', 'en');
    expect(normalRes.isEmergency).toBe(false);
  });

  it('2. classifyIntent maps health inquiries to domain routers', () => {
    expect(assistantService.classifyIntent('Meri dawai ka timing kya hai?')).toBe('medicine');
    expect(assistantService.classifyIntent('When is my doctor consultation?')).toBe('appointment');
    expect(assistantService.classifyIntent('Show my blood test report and OCR analysis')).toBe('report');
    expect(assistantService.classifyIntent('Timeline events pichle hafte kya hua tha?')).toBe('timeline');
    expect(assistantService.classifyIntent('Good morning, how are you?')).toBe('general');
  });

  it('3. synthesizeSpeech generates multilingual TTS audio stubs & metadata', () => {
    const enTts = assistantService.synthesizeSpeech('Take your medicine on time', 'en');
    expect(enTts.audioFormat).toBe('audio/mp3');
    expect(enTts.voiceName).toBe('en-IN-Wavenet-B');
    expect(enTts.audioContent).toBeDefined();

    const hiTts = assistantService.synthesizeSpeech('समय पर दवाई लें', 'hi');
    expect(hiTts.voiceName).toBe('hi-IN-Wavenet-A');

    const paTts = assistantService.synthesizeSpeech('ਸਮੇਂ ਸਿਰ ਦਵਾਈ ਲਵੋ', 'pa');
    expect(paTts.voiceName).toBe('pa-IN-Wavenet-A');
  });

  it('4. processChatMessage answers Medicine Q&A in Hindi with clinical context', async () => {
    const res = await assistantService.processChatMessage(patientUserId, {
      sessionId: 'sess-hi-med-01',
      message: 'Meri dawaiyan kya hain aur adherence kaisa hai?',
      language: 'hi',
    });

    expect(res.language).toBe('hi');
    expect(res.domain).toBe('medicine');
    expect(res.reply).toContain('नमस्ते');
    expect(res.reply).toContain('Metformin');
    expect(res.reply).toContain('Telmisartan');
    expect(res.reply).toContain('88%');
    expect(res.audioOutput).toBeDefined();
  });

  it('5. processChatMessage answers Appointment Q&A in Punjabi', async () => {
    const res = await assistantService.processChatMessage(patientUserId, {
      sessionId: 'sess-pa-appt-01',
      message: 'ਮੇਰੀ ਅਗਲੀ ਡਾਕਟਰ ਮੁਲਾਕਾਤ ਕਦੋਂ ਹੈ?',
      language: 'pa',
    });

    expect(res.language).toBe('pa');
    expect(res.domain).toBe('appointment');
    expect(res.reply).toContain('ਸਤ ਸ੍ਰੀ ਅਕਾਲ');
    expect(res.reply).toContain('Dr. Neha Verma');
    expect(res.audioOutput).toBeDefined();
  });

  it('6. processChatMessage answers Health Report & Medical OCR Q&A in English', async () => {
    const res = await assistantService.processChatMessage(patientUserId, {
      sessionId: 'sess-en-rep-01',
      message: 'What does my latest diagnostic lab report show?',
      language: 'en',
    });

    expect(res.language).toBe('en');
    expect(res.domain).toBe('report');
    expect(res.reply).toContain('Comprehensive Lipid Profile');
    expect(res.reply).toContain('moderate risk');
    expect(res.reply).toContain('cholesterol');
  });

  it('7. Emergency Voice Command triggers immediate multi-channel escalation', async () => {
    const notifSpy = vi.spyOn(notificationService, 'createNotification').mockResolvedValue({});
    const timelineSpy = vi.spyOn(timelineService, 'createEvent').mockResolvedValue({});

    const res = await assistantService.processChatMessage(patientUserId, {
      sessionId: 'sess-emergency-01',
      message: 'Bachao! Mujhe bahut tej chhati me dard ho raha hai',
      language: 'hi',
      inputType: 'voice',
    });

    expect(res.isEmergency).toBe(true);
    expect(res.domain).toBe('emergency');
    expect(res.reply).toContain('108');
    expect(res.reply).toContain('आपातकालीन');

    expect(notifSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: patientUserId,
        type: 'emergency',
        severity: 'critical',
      })
    );

    expect(timelineSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: patientUserId,
        eventType: 'emergency',
      })
    );
  });

  it('8. processVoiceMessage transcribes voice and generates speech synthesis response', async () => {
    const res = await assistantService.processVoiceMessage(patientUserId, {
      sessionId: 'sess-voice-01',
      transcript: 'What are my scheduled medicines today?',
      language: 'en',
    });

    expect(res.domain).toBe('medicine');
    expect(res.reply).toContain('Metformin');
    expect(res.audioOutput).toBeDefined();
    expect(res.audioOutput.audioContent).toBeDefined();
  });

  it('9. Controller endpoints handle /api/assistant/chat and /api/assistant/voice', async () => {
    let resData: any = null;
    let resStatus = 0;
    const resMock = {
      status: (code: number) => {
        resStatus = code;
        return {
          json: (data: any) => {
            resData = data;
          },
        };
      },
    };

    // Chat endpoint
    await assistantController.handleChat(
      {
        user: { _id: patientUserId },
        body: {
          sessionId: 'test-chat-endpoint',
          message: 'What is my health timeline history?',
          language: 'en',
        },
      } as any,
      resMock as any,
      () => {}
    );
    expect(resStatus).toBe(200);
    expect(resData.success).toBe(true);
    expect(resData.data.domain).toBe('timeline');

    // Voice endpoint
    await assistantController.handleVoice(
      {
        user: { _id: patientUserId },
        body: {
          sessionId: 'test-voice-endpoint',
          transcript: 'Meri dawaiyan dikhao',
          language: 'hi',
        },
      } as any,
      resMock as any,
      () => {}
    );
    expect(resStatus).toBe(200);
    expect(resData.success).toBe(true);
    expect(resData.data.domain).toBe('medicine');
    expect(resData.data.audioOutput).toBeDefined();

    // History endpoint
    await assistantController.getHistory(
      {
        user: { _id: patientUserId },
        params: { sessionId: 'test-chat-endpoint' },
      } as any,
      resMock as any,
      () => {}
    );
    expect(resStatus).toBe(200);
    expect(resData.success).toBe(true);
    expect(resData.count).toBeGreaterThanOrEqual(2);
  });
});
