import { useState, useEffect, useCallback } from 'react';
import { chatService, ChatSessionItem, ChatMessageItem } from '@/services/ai/chatService';
import { useToast } from '@/hooks/use-toast';

export function useAIChat() {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await chatService.getSessions();
      if (res.success && res.data) {
        setSessions(res.data);
        if (res.data.length > 0 && !activeSessionId) {
          setActiveSessionId(res.data[0]._id);
        }
      }
    } catch {
      // silently handle session fetch fallback
    } finally {
      setLoadingSessions(false);
    }
  }, [activeSessionId]);

  const fetchMessages = useCallback(async (sessionId: string) => {
    setLoadingMessages(true);
    try {
      const res = await chatService.getMessages(sessionId);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load chat history', variant: 'destructive' });
    } finally {
      setLoadingMessages(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, fetchMessages]);

  const createNewChat = async (title?: string) => {
    try {
      const res = await chatService.createSession(title);
      if (res.success && res.data) {
        setSessions((prev) => [res.data, ...prev]);
        setActiveSessionId(res.data._id);
        setMessages([]);
      }
    } catch {
      toast({ title: 'Error', description: 'Could not create new chat', variant: 'destructive' });
    }
  };

  const renameChat = async (sessionId: string, newTitle: string) => {
    try {
      const res = await chatService.renameSession(sessionId, newTitle);
      if (res.success && res.data) {
        setSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, title: newTitle } : s)));
        toast({ title: 'Renamed', description: 'Chat title updated' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to rename chat', variant: 'destructive' });
    }
  };

  const deleteChat = async (sessionId: string) => {
    try {
      await chatService.deleteSession(sessionId);
      setSessions((prev) => {
        const filtered = prev.filter((s) => s._id !== sessionId);
        if (activeSessionId === sessionId) {
          setActiveSessionId(filtered.length > 0 ? filtered[0]._id : null);
        }
        return filtered;
      });
      toast({ title: 'Deleted', description: 'Chat removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete chat', variant: 'destructive' });
    }
  };

  const sendMessage = async (content: string, attachments: object[] = []) => {
    if (!content.trim() && attachments.length === 0) return;

    setSending(true);
    setStreamingText('');

    const tempUserMsg: ChatMessageItem = {
      _id: 'temp-' + Date.now(),
      sessionId: activeSessionId || 'temp-session',
      sender: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      let accumulated = '';
      await chatService.streamSendMessage(
        { sessionId: activeSessionId || undefined, content, attachments },
        (chunk) => {
          accumulated += chunk;
          setStreamingText(accumulated);
        },
        (doneMsg) => {
          setStreamingText('');
          if (!activeSessionId) {
            setActiveSessionId(doneMsg.sessionId);
            fetchSessions();
          }
          setMessages((prev) => [...prev.filter((m) => !m._id.startsWith('temp-')), tempUserMsg, doneMsg]);
        }
      );
    } catch {
      // Fallback to standard request if stream breaks
      try {
        const res = await chatService.sendMessage({ sessionId: activeSessionId || undefined, content, attachments });
        if (res.success && res.data) {
          if (!activeSessionId) {
            setActiveSessionId(res.data.sessionId);
            fetchSessions();
          }
          setMessages((prev) => [
            ...prev.filter((m) => !m._id.startsWith('temp-')),
            res.data.userMessage,
            res.data.assistantMessage,
          ]);
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      }
    } finally {
      setSending(false);
    }
  };

  const feedbackMessage = async (messageId: string, feedback: 'like' | 'dislike' | null) => {
    try {
      const res = await chatService.feedbackMessage(messageId, feedback);
      if (res.success && res.data) {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, feedback } : m)));
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to record feedback', variant: 'destructive' });
    }
  };

  const filteredSessions = searchQuery
    ? sessions.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : sessions;

  return {
    sessions: filteredSessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    loadingSessions,
    loadingMessages,
    sending,
    streamingText,
    searchQuery,
    setSearchQuery,
    createNewChat,
    renameChat,
    deleteChat,
    sendMessage,
    feedbackMessage,
  };
}
