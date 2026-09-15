import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AIChat from '@/pages/AIChat';

// Mock useAIChat hook
const mockSendMessage = vi.fn();
const mockCreateNewChat = vi.fn();
const mockRenameChat = vi.fn();
const mockDeleteChat = vi.fn();
const mockFeedbackMessage = vi.fn();

vi.mock('@/hooks/ai/useAIChat', () => ({
  useAIChat: () => ({
    sessions: [
      { _id: 'sess-1', title: 'Cardiology Consultation', lastMessageText: 'Your resting HR is stable.' },
      { _id: 'sess-2', title: 'Diabetes Management', lastMessageText: 'Metformin morning dose.' },
    ],
    activeSessionId: 'sess-1',
    setActiveSessionId: vi.fn(),
    messages: [
      { _id: 'm1', sender: 'user', content: 'What does an elevated HbA1c mean?' },
      {
        _id: 'm2',
        sender: 'assistant',
        content: 'An elevated HbA1c of 7.8% indicates that your average blood glucose over the past 90 days has been higher than recommended.',
        mode: 'Diagnostic Interpretation',
        confidenceScore: 0.92,
      },
    ],
    loadingSessions: false,
    loadingMessages: false,
    sending: false,
    streamingText: '',
    searchQuery: '',
    setSearchQuery: vi.fn(),
    createNewChat: mockCreateNewChat,
    renameChat: mockRenameChat,
    deleteChat: mockDeleteChat,
    sendMessage: mockSendMessage,
    feedbackMessage: mockFeedbackMessage,
  }),
}));

// Mock useVoiceAI
vi.mock('@/hooks/ai/useVoiceAI', () => ({
  useVoiceAI: () => ({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    supported: true,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    speakText: vi.fn(),
    stopSpeaking: vi.fn(),
  }),
}));

// Mock SpeechSynthesis and scrollIntoView
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.SpeechSynthesisUtterance = class {
    text: string;
    lang: string = 'en-US';
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  } as any;
  window.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
  } as any;
});

describe('F33 — AI Healthcare Assistant UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AIChat header, clinical disclaimer banner, and active session', () => {
    render(<AIChat />);
    expect(screen.getByText(/HealthSphere AI Assistant/i)).toBeInTheDocument();
    expect(screen.getByTestId('clinical-disclaimer-banner')).toBeInTheDocument();
    expect(screen.getByText(/Clinical AI Decision Support/i)).toBeInTheDocument();
    expect(screen.getByText(/Cardiology Consultation/i)).toBeInTheDocument();
    expect(screen.getByText(/Diabetes Management/i)).toBeInTheDocument();
  });

  it('renders assistant message with confidence score and read aloud button', () => {
    render(<AIChat />);
    expect(screen.getByText(/What does an elevated HbA1c mean\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/An elevated HbA1c of 7.8% indicates that your average blood glucose/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 92%/i)).toBeInTheDocument();

    // Read Aloud button
    const readAloudBtn = screen.getByTestId('read-aloud-m2');
    expect(readAloudBtn).toBeInTheDocument();
    fireEvent.click(readAloudBtn);
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('supports multilingual language switching', () => {
    render(<AIChat />);
    expect(screen.getByTestId('language-selector')).toBeInTheDocument();

    const hindiBtn = screen.getByRole('button', { name: 'हिंदी' });
    fireEvent.click(hindiBtn);

    const punjabiBtn = screen.getByRole('button', { name: 'ਪੰਜਾਬੀ' });
    fireEvent.click(punjabiBtn);

    const englishBtn = screen.getByRole('button', { name: 'EN' });
    fireEvent.click(englishBtn);
  });

  it('triggers Voice Assistant Modal via toolbar mic button', () => {
    render(<AIChat />);
    const micBtn = screen.getByTestId('voice-input-mic-btn');
    expect(micBtn).toBeInTheDocument();
    fireEvent.click(micBtn);

    expect(screen.getByText(/Speak with HealthSphere AI/i)).toBeInTheDocument();
  });

  it('handles message input and sending', () => {
    render(<AIChat />);
    const textarea = screen.getByPlaceholderText(/Ask HealthSphere AI anything/i);
    fireEvent.change(textarea, { target: { value: 'How can I lower blood pressure?' } });

    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    expect(mockSendMessage).toHaveBeenCalledWith('How can I lower blood pressure?', []);
  });
});
