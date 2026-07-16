import { useEffect, useRef, useState } from 'react';
import { socket } from '@/services/socket';
import { useAuth } from '@/contexts/AuthContext';

interface AIResponse {
  response: string;
  followUpQuestions: string[];
  healthCategory: string;
  riskLevel: string;
  recommendations: string[];
  requiresDoctor: boolean;
}

export function useChatSocket() {
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [isTyping, setIsTyping] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const connected = useRef(false);
  const { user } = useAuth();

  const startConversation = () => {
    if (!user?.id) return;

    socket.emit('start_conversation', {
      userId: user.id,
    });
  };

  const sendMessage = (message: string) => {
    console.log('conversationId =', conversationId);

    if (!conversationId) {
      console.error('No conversationId found');
      return;
    }

    socket.emit('send_message', {
      conversationId,
      message,
    });
  };

  useEffect(() => {
    if (connected.current) return;

    connected.current = true;

    socket.connect();

    socket.on('connect', () => {
      console.log('🟢 Socket Connected', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket Disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error(err);

      setError(err.message);
    });

    socket.on('bot_typing', (typing: boolean) => {
      setIsTyping(typing);
    });

    socket.on('conversation_started', (data) => {
      console.log('✅ Conversation Started');

      console.log(data);

      setConversationId(data.data.conversationId);
      console.log('Conversation ID received:', data.data.conversationId);
    });

    socket.on('receive_message', (response) => {
      console.log('🤖 AI Response');

      console.log(response);

      setAiResponse(response.data);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  return {
    socket,

    conversationId,

    setConversationId,

    startConversation,

    sendMessage,

    aiResponse,

    isTyping,

    error,
  };
}
