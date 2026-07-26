import { api, tokenStore } from '@/services/api';

export interface ChatSessionItem {
  _id: string;
  title: string;
  isPinned: boolean;
  lastMessageText: string;
  lastActivityAt: string;
}

export interface ChatMessageItem {
  _id: string;
  sessionId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Array<{ url: string; fileType: string; name: string }>;
  feedback?: 'like' | 'dislike' | null;
  suggestedFollowUps?: string[];
  mode?: string;
  confidenceScore?: number;
  isEmergency?: boolean;
  emergencyData?: {
    warning?: string;
    hospitalsApiRecommended?: boolean;
    numbers?: string[];
  };
  smartRecommendations?: {
    relatedQuestions?: string[];
    lifestyleTips?: string[];
    medicineReminder?: string;
    waterReminder?: string;
    exerciseSuggestion?: string;
    dietSuggestion?: string;
  };
  createdAt: string;
}


export const chatService = {
  getSessions: () =>
    api.get<{ success: boolean; data: ChatSessionItem[] }>('/chat/sessions'),

  createSession: (title?: string) =>
    api.post<{ success: boolean; data: ChatSessionItem }>('/chat/sessions', { title }),

  renameSession: (sessionId: string, title: string) =>
    api.put<{ success: boolean; data: ChatSessionItem }>(`/chat/sessions/${sessionId}`, { title }),

  deleteSession: (sessionId: string) =>
    api.delete<{ success: boolean; message: string }>(`/chat/sessions/${sessionId}`),

  getMessages: (sessionId: string) =>
    api.get<{ success: boolean; data: ChatMessageItem[] }>(`/chat/sessions/${sessionId}/messages`),

  sendMessage: (payload: { sessionId?: string; content: string; attachments?: object[] }) =>
    api.post<{ success: boolean; data: { sessionId: string; userMessage: ChatMessageItem; assistantMessage: ChatMessageItem } }>('/chat/messages', payload),

  feedbackMessage: (messageId: string, feedback: 'like' | 'dislike' | null) =>
    api.put<{ success: boolean; data: ChatMessageItem }>(`/chat/messages/${messageId}/feedback`, { feedback }),

  searchChats: (query: string) =>
    api.get<{ success: boolean; data: ChatMessageItem[] }>(`/chat/search?query=${encodeURIComponent(query)}`),

  // Streaming AI response helper using SSE
  streamSendMessage: async (
    payload: { sessionId?: string; content: string; attachments?: object[] },
    onChunk: (chunk: string) => void,
    onDone: (assistantMsg: ChatMessageItem) => void
  ) => {
    const token = tokenStore.get();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    
    const response = await fetch(`${API_BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Streaming failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.replace('data: ', ''));
            if (parsed.type === 'chunk') {
              onChunk(parsed.content);
            } else if (parsed.type === 'done') {
              onDone(parsed.assistantMessage);
            }
          } catch {
            // ignore parse error on incomplete chunks
          }
        }
      }
    }
  },
};
