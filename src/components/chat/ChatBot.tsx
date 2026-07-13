import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Mic,
  Volume2,
  AlertTriangle,
  ImagePlus,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  imageUrl?: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use the new hooks
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

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput((prev) => prev + ' ' + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Auto-scroll to bottom when new messages arrive or chat opens
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Use a small timeout to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timeoutId);
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            "Hello! I'm your HealthSphere AI assistant. I can help you with health questions, medication reminders, appointment info, and general wellness guidance. How can I assist you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  // 🔒 Lock background scroll when chatbot is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  const handleVoiceInput = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    // Request permission if needed
    if (micPermission === 'prompt') {
      const granted = await requestMicPermission();
      if (!granted) {
        toast({
          title: 'Microphone Error',
          description: 'Microphone permission is required for voice input',
          variant: 'destructive',
        });
        return;
      }
    }

    if (!hasPermission && micPermission === 'denied') {
      toast({
        title: 'Permission Denied',
        description:
          'Please enable microphone permissions in your browser settings',
        variant: 'destructive',
      });
      return;
    }

    startListening();
  };

  const extractRiskLevel = (
    content: string,
  ): { riskLevel?: Message['riskLevel']; cleanContent: string } => {
    const riskMatch = content.match(/\[RISK:(LOW|MEDIUM|HIGH|CRITICAL)\]/);
    if (riskMatch) {
      return {
        riskLevel: riskMatch[1] as Message['riskLevel'],
        cleanContent: content.replace(riskMatch[0], '').trim(),
      };
    }
    return { cleanContent: content };
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    console.log('Image upload triggered');
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // For now, show a message. In production, upload to storage
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('File read complete');

      const base64WithPrefix = e.target?.result as string;
      const mimeType = file.type;
      const base64 = base64WithPrefix.split(',')[1];

      setSelectedImage({
        data: base64,
        mimeType,
      });

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim() || 'Please analyze this medical report.',
        imageUrl: base64WithPrefix, // ✅ THIS WAS MISSING
        timestamp: new Date(),
      };

      setInput('');

      toast({
        title: 'Image Uploaded',
        description: 'Image ready for analysis',
      });
    };
    reader.readAsDataURL(file);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: 'Error',
        description: 'Text-to-speech is not supported',
        variant: 'destructive',
      });
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    console.log('🔥 handleSend triggered');
    e?.preventDefault();

    if (isLoading) return;

    if (!input.trim() && !selectedImage) {
      console.log('Nothing to send');
      return;
    }

    setIsLoading(true);

    try {
      // 1️⃣ Create userMessage (you already have this)

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim() || 'Image attached',
        imageUrl: selectedImage
          ? `data:${selectedImage.mimeType};base64,${selectedImage.data}`
          : undefined,
        timestamp: new Date(),
      };

      // 2️⃣ Update UI immediately
      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        return newMessages;
      });

      // 3️⃣ Prepare messages for API (DECLARE OUTSIDE FETCH)
      const updatedMessages = [
        ...messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: m.role,
            content: m.content,
          })),
        {
          role: userMessage.role,
          content: userMessage.content,
        },
      ];

      const data = await api.post('/health/chat', {
        messages: updatedMessages,
        image: selectedImage,
      });

      const aiText = data?.choices?.[0]?.message?.content || 'No response';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiText,
          timestamp: new Date(),
        },
      ]);

      setInput('');
      setSelectedImage(null);
    } catch (error) {
      console.error('Chat error:', error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEmergencyClick = () => {
    setIsOpen(false);
    navigate('/emergency');
  };

  const getRiskBadge = (riskLevel?: Message['riskLevel']) => {
    if (!riskLevel) return null;
    const variants = {
      LOW: 'risk-low',
      MEDIUM: 'risk-medium',
      HIGH: 'risk-high',
      CRITICAL: 'risk-critical',
    };
    return (
      <Badge className={cn('ml-2 text-xs', variants[riskLevel])}>
        {riskLevel === 'CRITICAL' && <AlertTriangle className="mr-1 h-3 w-3" />}
        {riskLevel}
      </Badge>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="
  fixed
  right-6
  top-20
  bottom-6
  z-50
  w-96
  max-w-[calc(100vw-3rem)]
  overflow-hidden
  rounded-2xl
  border
  bg-card
  shadow-2xl
  flex
  flex-col
"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Health Assistant</h3>
                  <p className="text-xs opacity-80">AI-powered guidance</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'flex-row-reverse' : '',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted',
                        )}
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'flex-1 rounded-2xl px-4 py-2.5',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted',
                        )}
                      >
                        {message.imageUrl && (
                          <img
                            src={message.imageUrl}
                            alt="uploaded"
                            className="max-w-[200px] rounded-lg mb-2"
                          />
                        )}
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        {message.role === 'assistant' && (
                          <div className="mt-2 flex items-center gap-2">
                            {message.riskLevel &&
                              getRiskBadge(message.riskLevel)}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => speakText(message.content)}
                              title="Read aloud"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl bg-muted px-4 py-3">
                        <div className="flex gap-1">
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Controls */}
            <div className="border-t p-3 space-y-2">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTtsEnabled((prev) => !prev)}
                  className={ttsEnabled ? 'bg-primary/10' : ''}
                  title="Toggle text-to-speech"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVoiceInput}
                  disabled={micPermission === 'denied'}
                  className={
                    isListening
                      ? 'bg-destructive/20 border-destructive text-destructive hover:bg-destructive/30'
                      : ''
                  }
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <Mic className="h-4 w-4" />
                  <span className="text-xs ml-1">
                    {isListening ? 'Stop' : 'Voice'}
                  </span>
                </Button>
                {speechError && (
                  <span className="text-xs text-destructive px-2 animate-pulse">
                    {speechError}
                  </span>
                )}
                {isListening && interimTranscript && (
                  <span className="text-xs text-muted-foreground px-2">
                    {interimTranscript}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  title="Upload image"
                >
                  <label className="cursor-pointer">
                    <ImagePlus className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmergencyClick}
                  className="ml-auto text-destructive hover:bg-destructive/10"
                  title="Emergency"
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* 🔥 IMAGE PREVIEW GOES HERE */}
              {selectedImage && (
                <div className="relative inline-block mt-2">
                  <img
                    src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`}
                    className="max-h-24 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your health..."
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || (!input.trim() && !selectedImage)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-fab text-primary-foreground"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </motion.button>
    </>
  );
}
