import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Bot,
  MessageSquare,
  Sparkles,
  Sliders,
  ShieldCheck,
  PlusCircle,
  Stethoscope,
  Pill,
  FileText,
  Heart,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput, type SelectedImage } from '@/components/chat/ChatInput';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { HealthInsightsPanel } from '@/components/chat/HealthInsightsPanel';
import { AISettingsModal } from '@/components/chat/AISettingsModal';
import { generateFrontendAIResponse } from '@/components/chat/aiResponseGenerator';
import type { Message, Conversation, AISettings, AttachmentItem } from '@/components/chat/types';
import { useToast } from '@/hooks/use-toast';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-page',
      role: 'assistant',
      content: `### 🩺 Welcome to HealthSphere Clinical AI

I am your 24/7 personal health assistant. How can I help you today?

* **Symptom Assessment**: Triage sharp, persistent, or mild symptoms safely.
* **Medication Guidance**: Dose schedules, meal timing, and drug interactions.
* **Lab Report Interpretation**: Understand lipid profiles, CBC, and blood glucose markers.

> 💡 *Choose a quick action below or type a query to begin.*`,
      timestamp: new Date(),
      suggestions: [
        'Analyze my symptoms',
        'Explain Metformin 500mg dosage',
        'Understand my lipid blood test',
        'DASH diet for hypertension',
      ],
    },
  ]);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      _id: 'c1',
      title: 'Metformin & Meal Timing',
      lastMessageAt: new Date().toISOString(),
      isPinned: true,
      previewText: 'Take oral metformin with breakfast/dinner to reduce GI upset.',
    },
    {
      _id: 'c2',
      title: 'Hypertension DASH Diet Strategy',
      lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
      isPinned: false,
      previewText: 'Low sodium intake target < 2,300 mg/day.',
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>('c1');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [suggestionText, setSuggestionText] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [settings, setSettings] = useState<AISettings>({
    responseLength: 'detailed',
    language: 'en',
    voice: 'natural',
    autoSpeak: false,
    highRiskAlerts: true,
  });

  const { toast } = useToast();

  const handleSend = (content: string, image?: SelectedImage, attachment?: AttachmentItem) => {
    setIsLoading(true);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || (attachment ? `Attached: ${attachment.name}` : 'Image attached'),
      imageUrl: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
      attachment,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
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
      setIsLoading(false);
    }, 1000);
  };

  const startNewChat = useCallback(() => {
    setSelectedConversation(null);
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Started a **New Clinical Consultation**. What medical query or diagnostic report would you like to review?",
        timestamp: new Date(),
        suggestions: [
          'Analyze my symptoms',
          'Explain my medication',
          'Review lab blood report',
        ],
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-950 text-white py-8 px-4 sm:px-6 shadow-md border-b border-teal-800/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
                <Activity className="h-5 w-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-heading">
                AI Health Consultation Workspace
              </h1>
              <Badge className="bg-teal-500/20 text-teal-200 border-teal-400/30 font-bold uppercase text-[9px]">
                Active Triage
              </Badge>
            </div>
            <p className="text-xs text-teal-200/80 max-w-xl">
              Real-time clinical triage, medication breakdown, lab report interpretation, and personalized health recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs font-bold gap-1.5"
            >
              <Sliders className="h-4 w-4" /> Preferences
            </Button>
            <Button
              size="sm"
              onClick={startNewChat}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* History Sidebar - Desktop (3 cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="h-[740px] rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <ConversationSidebar
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelect={(id) => setSelectedConversation(id)}
                onDelete={(id) => setConversations((prev) => prev.filter((c) => c._id !== id))}
                onNewChat={startNewChat}
                onPin={(id) =>
                  setConversations((prev) =>
                    prev.map((c) => (c._id === id ? { ...c, isPinned: !c.isPinned } : c))
                  )
                }
              />
            </div>
          </div>

          {/* Main Chat Workspace (6 cols desktop) */}
          <div className="col-span-1 lg:col-span-6">
            <Card className="h-[740px] rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
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
              />

              <ChatInput
                isLoading={isLoading}
                onSend={handleSend}
                ttsEnabled={ttsEnabled}
                onToggleTts={() => setTtsEnabled(!ttsEnabled)}
                isListening={false}
                transcript=""
                interimTranscript=""
                speechError={null}
                onVoiceInput={() => {}}
                resetTranscript={() => {}}
                onEmergencyClick={() => {}}
                suggestionText={suggestionText}
                onClearSuggestion={() => setSuggestionText(undefined)}
              />
            </Card>
          </div>

          {/* Health Insights Sidebar (3 cols desktop) */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <HealthInsightsPanel />
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      <AISettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
        onClearHistory={() => {
          setConversations([]);
          startNewChat();
          toast({ title: 'History Cleared', description: 'Conversation records cleared.' });
        }}
        messages={messages}
      />
    </div>
  );
}
