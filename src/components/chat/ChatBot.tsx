import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

// Sub-components
import { ChatHeader } from './ChatHeader';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatMessages } from './ChatMessages';
import { ChatInput, SelectedImage } from './ChatInput';
import { Message, Conversation, ChatHistoryResponse } from './types';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  
  // Suggestion state passed to ChatInput
  const [suggestionText, setSuggestionText] = useState<string | undefined>();

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Custom Hooks
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    hasPermission,
  } = useSpeechRecognition();
  const { micPermission, requestMicPermission } = useMediaPermissions();
  const {
    conversationId,
    startConversation,
    sendMessage,
    aiResponse,
  } = useChatSocket();

  // Load conversations when chatbot opens
  useEffect(() => {
    if (!isOpen) return;

    loadConversations();

    if (messages.length === 0) {
      startNewChat();
    }
  }, [isOpen]);

  // Handle incoming AI responses
  useEffect(() => {
    if (!aiResponse) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponse.response,
        riskLevel: aiResponse.riskLevel as Message['riskLevel'],
        timestamp: new Date(),
      },
    ]);
    setIsLoading(false);
  }, [aiResponse]);

  // Lock body scroll when chatbot is open on mobile to prevent double scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden', 'md:overflow-auto');
    } else {
      document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
    }
    return () => document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
  }, [isOpen]);

  // Sync active conversation
  useEffect(() => {
    if (!conversationId) return;
    setSelectedConversation(conversationId);
    loadConversations();
  }, [conversationId]);

  // API Calls
  const loadConversations = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get<ChatHistoryResponse>(`/chat/conversations/${user.id}`);
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversationMessages = async (id: string) => {
    try {
      setSelectedConversation(id);
      const res = await api.get<any>(`/chat/conversation/${id}`);
      const history: Message[] = res.data.messages.map((message: any, index: number) => ({
        id: `${index}`,
        role: message.role === 'model' ? 'assistant' : 'user',
        content: message.text,
        riskLevel: message.riskLevel?.toUpperCase(),
        timestamp: new Date(message.createdAt),
      }));
      setMessages(history);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load conversation.', variant: 'destructive' });
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await api.delete(`/chat/conversation/${id}`);
      setConversations((prev) => prev.filter((chat) => chat._id !== id));
      if (selectedConversation === id) {
        startNewChat();
      }
      toast({ title: 'Conversation Deleted', description: 'The conversation has been deleted successfully.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Delete Failed', description: 'Unable to delete conversation.', variant: 'destructive' });
    }
  };

  const startNewChat = () => {
    setSelectedConversation(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your HealthSphere AI assistant. I can help you with health questions, medication reminders, appointment info, and general wellness guidance. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
    startConversation();
    setTimeout(() => loadConversations(), 500);
  };

  // Input Handlers
  const handleVoiceInput = async () => {
    if (isListening) {
      stopListening();
      return;
    }
    if (micPermission === 'prompt') {
      const granted = await requestMicPermission();
      if (!granted) {
        toast({ title: 'Microphone Error', description: 'Permission required for voice input', variant: 'destructive' });
        return;
      }
    }
    if (!hasPermission && micPermission === 'denied') {
      toast({ title: 'Permission Denied', description: 'Please enable microphone permissions in browser', variant: 'destructive' });
      return;
    }
    startListening();
  };

  const handleSend = (content: string, image?: SelectedImage) => {
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || 'Image attached',
      imageUrl: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessage(content);
  };

  const handleEmergencyClick = () => {
    setIsOpen(false);
    navigate('/emergency');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed z-50 overflow-hidden bg-card border shadow-2xl flex flex-col",
              // Mobile: Fullscreen modal
              "inset-0 w-full h-full rounded-none",
              // Tablet/Desktop: Floating panel
              "md:top-20 md:bottom-6 md:right-6 md:left-auto md:w-[90vw] md:max-w-[900px] md:h-auto md:rounded-2xl"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="HealthSphere AI Chatbot"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false);
            }}
          >
            <ChatHeader 
              onClose={() => setIsOpen(false)} 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />

            <div className="flex flex-1 min-h-0 relative">
              {/* Desktop Sidebar (Fixed) */}
              <div className="hidden lg:block w-[260px] border-r border-border/50 shrink-0 bg-background/50">
                <ConversationSidebar
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelect={loadConversationMessages}
                  onDelete={deleteConversation}
                  onNewChat={startNewChat}
                />
              </div>

              {/* Mobile Sidebar Overlay */}
              <AnimatePresence>
                {isSidebarOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSidebarOpen(false)}
                      className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden"
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                      className="absolute inset-y-0 left-0 w-3/4 max-w-[300px] border-r bg-card z-30 lg:hidden shadow-xl"
                    >
                      <ConversationSidebar
                        conversations={conversations}
                        selectedConversation={selectedConversation}
                        onSelect={loadConversationMessages}
                        onDelete={deleteConversation}
                        onNewChat={startNewChat}
                        onCloseMobile={() => setIsSidebarOpen(false)}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Main Chat Area */}
              <div className="flex flex-col flex-1 min-w-0 bg-background/50">
                <ChatMessages 
                  messages={messages} 
                  isLoading={isLoading} 
                  onSuggestionClick={(text) => setSuggestionText(text)} 
                />
                
                <ChatInput
                  isLoading={isLoading}
                  onSend={handleSend}
                  ttsEnabled={ttsEnabled}
                  onToggleTts={() => setTtsEnabled(!ttsEnabled)}
                  isListening={isListening}
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  speechError={speechError}
                  onVoiceInput={handleVoiceInput}
                  resetTranscript={resetTranscript}
                  onEmergencyClick={handleEmergencyClick}
                  suggestionText={suggestionText}
                  onClearSuggestion={() => setSuggestionText(undefined)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="chat-fab text-primary-foreground shadow-lg flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-primary/50"
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
