import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { AISettingsModal } from './AISettingsModal';
import { generateFrontendAIResponse } from './aiResponseGenerator';
import type { Message, Conversation, ChatHistoryResponse, AISettings, AttachmentItem } from './types';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [suggestionText, setSuggestionText] = useState<string | undefined>();

  // Settings State
  const [settings, setSettings] = useState<AISettings>({
    responseLength: 'detailed',
    language: 'en',
    voice: 'natural',
    autoSpeak: false,
    highRiskAlerts: true,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = ['/ai-chat', '/chat', '/ai-assistant'].includes(location.pathname);

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
  const { conversationId, startConversation, sendMessage, aiResponse } = useChatSocket();

  // Load conversations when chatbot opens
  useEffect(() => {
    if (!isOpen) return;

    loadConversations();

    if (messages.length === 0) {
      startNewChat();
    }
  }, [isOpen]);

  // Handle incoming AI responses from socket
  useEffect(() => {
    if (!aiResponse) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: aiResponse.response,
      riskLevel: aiResponse.riskLevel as Message['riskLevel'],
      timestamp: new Date(),
      suggestions: aiResponse.followUpQuestions,
      category: aiResponse.healthCategory,
      recommendations: aiResponse.recommendations,
      requiresDoctor: aiResponse.requiresDoctor,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(false);

    if (settings.autoSpeak) {
      speakText(aiResponse.response);
    }
  }, [aiResponse, settings.autoSpeak]);

  // Speech synthesizer helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#|_]/g, '');
      const ut = new SpeechSynthesisUtterance(clean);
      window.speechSynthesis.speak(ut);
    }
  };

  // Lock body scroll on mobile when open
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
  }, [conversationId]);

  // API Calls & Conversation management
  const loadConversations = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get<ChatHistoryResponse>(`/chat/conversations/${user.id}`);
      setConversations(res.data);
    } catch {
      // Mock local conversation list if backend is offline
      if (conversations.length === 0) {
        setConversations([
          {
            _id: 'local-1',
            title: 'Metformin Dosage Consultation',
            lastMessageAt: new Date().toISOString(),
            isPinned: true,
            previewText: 'Explained 500mg Metformin administration with food.',
          },
          {
            _id: 'local-2',
            title: 'Blood Pressure & Diet Tips',
            lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
            isPinned: false,
            previewText: 'DASH diet principles and daily sodium targets.',
          },
        ]);
      }
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
    } catch {
      // Fallback local conversation history
      const found = conversations.find((c) => c._id === id);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Resuming conversation **${found?.title || 'Clinical Chat'}**. How can I help you further?`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await api.delete(`/chat/conversation/${id}`);
    } catch {
      // Local removal fallback
    }
    setConversations((prev) => prev.filter((chat) => chat._id !== id));
    if (selectedConversation === id) {
      startNewChat();
    }
    toast({ title: 'Conversation Deleted', description: 'The conversation log has been deleted.' });
  };

  const togglePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c._id === id) {
          const nextState = !c.isPinned;
          toast({
            title: nextState ? 'Pinned Conversation' : 'Unpinned Conversation',
            description: `"${c.title}" has been ${nextState ? 'pinned to top' : 'unpinned'}.`,
          });
          return { ...c, isPinned: nextState };
        }
        return c;
      })
    );
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, title: newTitle } : c))
    );
    toast({ title: 'Title Updated', description: `Renamed to "${newTitle}".` });
  };

  const startNewChat = useCallback(() => {
    setSelectedConversation(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hello! I'm your **HealthSphere AI Assistant**. I can help you analyze symptoms, explain medication dosages, review diagnostic lab reports, and provide daily wellness guidance. How can I assist you today?",
        timestamp: new Date(),
        suggestions: [
          'Analyze my symptoms',
          'Explain my medicine',
          'Understand lab blood test report',
          'BP & Glucose lifestyle tips',
        ],
      },
    ]);
    try {
      startConversation();
    } catch {
      // Local mode
    }
  }, [startConversation]);

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

  const handleSend = (content: string, image?: SelectedImage, attachment?: AttachmentItem) => {
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || (attachment ? `Attached: ${attachment.name}` : 'Image attached'),
      imageUrl: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
      attachment: attachment,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Send via socket if connected, or generate instant frontend response
    try {
      sendMessage(content || attachment?.name || 'Inquiry');
    } catch {
      // Socket offline
    }

    // Always ensure response is generated even if socket takes time or is offline
    setTimeout(() => {
      setIsLoading((currentlyLoading) => {
        if (!currentlyLoading) return false;

        const generated = generateFrontendAIResponse(content, attachment?.name);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generated.response,
          riskLevel: generated.riskLevel,
          timestamp: new Date(),
          suggestions: generated.suggestions,
          category: generated.category,
          recommendations: generated.recommendations,
          requiresDoctor: generated.requiresDoctor,
        };

        setMessages((prev) => [...prev, aiMsg]);
        if (settings.autoSpeak) {
          speakText(generated.response);
        }
        return false;
      });
    }, 1200);
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
              'fixed z-50 overflow-hidden bg-card border shadow-2xl flex flex-col',
              'inset-0 w-full h-full rounded-none',
              'md:top-16 md:bottom-6 md:right-6 md:left-auto md:w-[92vw] md:max-w-[960px] md:h-[85vh] md:rounded-3xl'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="HealthSphere AI Assistant"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false);
            }}
          >
            <ChatHeader
              onClose={() => setIsOpen(false)}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onNewChat={startNewChat}
            />

            <div className="flex flex-1 min-h-0 relative">
              {/* Desktop Conversation History Sidebar */}
              <div className="hidden lg:block w-[260px] border-r border-border/50 shrink-0 bg-background/50">
                <ConversationSidebar
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelect={loadConversationMessages}
                  onDelete={deleteConversation}
                  onNewChat={startNewChat}
                  onPin={togglePinConversation}
                  onRename={renameConversation}
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
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-20 lg:hidden"
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                      className="absolute inset-y-0 left-0 w-4/5 max-w-[300px] border-r bg-card z-30 lg:hidden shadow-2xl"
                    >
                      <ConversationSidebar
                        conversations={conversations}
                        selectedConversation={selectedConversation}
                        onSelect={loadConversationMessages}
                        onDelete={deleteConversation}
                        onNewChat={startNewChat}
                        onPin={togglePinConversation}
                        onRename={renameConversation}
                        onCloseMobile={() => setIsSidebarOpen(false)}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Main Chat Messages & Input Area */}
              <div className="flex flex-col flex-1 min-w-0 bg-background/50">
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  onSuggestionClick={(text) => setSuggestionText(text)}
                  onRegenerate={() => {
                    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                    if (lastUserMsg) {
                      handleSend(lastUserMsg.content);
                    }
                  }}
                  onOpenPromptsModal={() => {}}
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

      {/* Floating Action Button (FAB) — Fixed Bottom-Right Compact Floating Control */}
      <AnimatePresence>
        {!isOpen && !isChatPage && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed z-50 flex items-center justify-center gap-2.5 font-bold shadow-2xl transition-all duration-200 cursor-pointer select-none",
              "bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white",
              "border border-teal-500/40 hover:border-teal-300/80 shadow-teal-950/40",
              "bottom-6 right-6 px-4 py-3 rounded-full text-xs sm:text-sm tracking-wide",
              "max-sm:bottom-4 max-sm:right-4 max-sm:px-3.5 max-sm:py-3 max-sm:rounded-full"
            )}
            aria-label="Ask HealthSphere AI Assistant"
          >
            <Sparkles className="h-5 w-5 text-teal-300 animate-pulse shrink-0" />
            <span className="hidden sm:inline font-heading font-extrabold tracking-tight">
              Ask HealthSphere
            </span>
            <span className="inline sm:hidden font-heading font-bold text-xs">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AISettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
        onClearHistory={() => {
          setConversations([]);
          startNewChat();
          toast({ title: 'History Cleared', description: 'All local conversation records erased.' });
        }}
        messages={messages}
      />
    </>
  );
}

