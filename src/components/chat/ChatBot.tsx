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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
      const imageUrl = e.target?.result as string;
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: '[Image uploaded]',
        imageUrl,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      toast({
        title: 'Image Uploaded',
        description: 'Your image has been sent to the assistant',
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatMessages = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      chatMessages.push({ role: 'user', content: userMessage.content });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: chatMessages }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              const { riskLevel, cleanContent } =
                extractRiskLevel(assistantContent);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: cleanContent, riskLevel }
                    : m,
                ),
              );
            }
          } catch {
            // Continue on parse error
          }
        }
      }

      // Speak response if TTS is enabled
      if (ttsEnabled) {
        const { cleanContent } = extractRiskLevel(assistantContent);
        speakText(cleanContent);
      }

      // Save to database
      if (user) {
        const { riskLevel } = extractRiskLevel(assistantContent);
        await supabase.from('chat_messages').insert([
          { user_id: user.id, role: 'user', content: userMessage.content },
          {
            user_id: user.id,
            role: 'assistant',
            content: assistantContent,
            risk_level: riskLevel,
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
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
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border bg-card shadow-2xl flex flex-col"
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
            <div
              ref={scrollAreaRef}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <ScrollArea className="h-full flex-1">
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
                  onClick={() => setTtsEnabled(!ttsEnabled)}
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

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
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
                  disabled={isLoading || !input.trim()}
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
