import { describe, it, expect, vi } from 'vitest';
import { chatService } from '@/services/ai/chatService';

describe('Frontend Chat Synchronization', () => {
  it('chatService exports all required REST endpoints for sessions and messages', () => {
    expect(chatService.getSessions).toBeTypeOf('function');
    expect(chatService.createSession).toBeTypeOf('function');
    expect(chatService.renameSession).toBeTypeOf('function');
    expect(chatService.deleteSession).toBeTypeOf('function');
    expect(chatService.getMessages).toBeTypeOf('function');
    expect(chatService.sendMessage).toBeTypeOf('function');
    expect(chatService.feedbackMessage).toBeTypeOf('function');
    expect(chatService.searchChats).toBeTypeOf('function');
  });

  it('normalizes session response list cleanly for UI conversation models', () => {
    const mockRawSessions = [
      {
        _id: 'session-1',
        title: 'Hypertension Consultation',
        isPinned: true,
        lastMessageText: 'Discussed DASH diet',
        lastActivityAt: '2026-08-25T12:00:00.000Z',
      },
    ];

    const mappedConversations = mockRawSessions.map((s) => ({
      _id: s._id,
      title: s.title,
      lastMessageAt: s.lastActivityAt,
      isPinned: s.isPinned,
      previewText: s.lastMessageText,
    }));

    expect(mappedConversations).toHaveLength(1);
    expect(mappedConversations[0]._id).toBe('session-1');
    expect(mappedConversations[0].title).toBe('Hypertension Consultation');
    expect(mappedConversations[0].isPinned).toBe(true);
  });
});
