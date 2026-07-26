import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/ai/useAIChat';
import { VoiceAssistantModal } from '@/components/ai/VoiceAssistantModal';
import { GlobalAISearchModal } from '@/components/ai/GlobalAISearchModal';
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit2,
  Send,
  Paperclip,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  Check,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AIChat() {
  const {
    sessions,
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
  } = useAIChat();

  const [inputContent, setInputContent] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; type: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const suggestedQuestions = [
    'Analyze my latest fasting blood sugar levels',
    'What are potential side effects of active medications?',
    'Explain CBC normal ranges for hemoglobin',
    'Generate a 7-day heart health diet plan',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = () => {
    if (!inputContent.trim() && !selectedFile) return;
    const attachments = selectedFile ? [selectedFile] : [];
    sendMessage(inputContent, attachments);
    setInputContent('');
    setSelectedFile(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        url: reader.result as string,
        type: file.type.includes('image') ? 'image' : 'pdf',
      });
      toast({ title: 'File attached', description: file.name });
    };
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copied', description: 'Message copied to clipboard' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRenameSubmit = (sessionId: string) => {
    if (editingTitleText.trim()) {
      renameChat(sessionId, editingTitleText.trim());
    }
    setEditingTitleId(null);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
      {/* Sidebar: Multi Chat List */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading">
                AI Conversations
              </h2>
            </div>
            <Button
              onClick={() => createNewChat()}
              size="sm"
              className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold gap-1 text-xs"
            >
              <Plus className="w-4 h-4" /> New Chat
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingSessions && (
            <div className="text-center py-6 text-xs text-slate-400 animate-pulse">Loading conversations...</div>
          )}

          {!loadingSessions && sessions.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">No active conversations. Start a new chat!</div>
          )}

          {sessions.map((s) => {
            const isActive = s._id === activeSessionId;
            const isEditing = s._id === editingTitleId;

            return (
              <div
                key={s._id}
                onClick={() => setActiveSessionId(s._id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-200/50 dark:border-teal-800/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white dark:bg-slate-800 border border-teal-500 text-xs outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleRenameSubmit(s._id)} className="text-teal-600">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingTitleId(null)} className="text-rose-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="truncate flex-1 pr-2">
                      <p className="truncate font-bold">{s.title}</p>
                      <p className="text-[10px] text-slate-400 truncate font-normal">
                        {s.lastMessageText || 'New Chat'}
                      </p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTitleId(s._id);
                          setEditingTitleText(s.title);
                        }}
                        className="p-1 text-slate-400 hover:text-teal-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(s._id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Interface Main Area */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Chat Header */}
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-700 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">HealthSphere AI Assistant</h3>
              <p className="text-[10px] text-emerald-600 font-semibold">Gemini Clinical Intelligence Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-teal-600" /> AI Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceOpen(true)}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 gap-1.5"
            >
              <Mic className="w-3.5 h-3.5 text-rose-500" /> Voice AI
            </Button>
          </div>
        </div>

        {/* Message Stream Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingMessages && (
            <div className="text-center py-12 text-xs text-slate-400 animate-pulse">Loading message history...</div>
          )}

          {!loadingMessages && messages.length === 0 && (
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                  How can HealthSphere AI assist you today?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ask medical questions, analyze reports, or check medication guidelines.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(q)}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 transition-all text-left shadow-sm"
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m._id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 mt-1 shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-xl space-y-2`}>
                  <div
                    className={`p-4 rounded-3xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-teal-700 text-white rounded-tr-none shadow-md font-medium'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm whitespace-pre-wrap'
                    }`}
                  >
                    {m.content}

                    {/* File Attachment preview */}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2 text-[11px]">
                        <FileText className="w-4 h-4" />
                        <span className="underline font-mono">{m.attachments[0].name}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Assistant Message */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
                      <button
                        onClick={() => copyToClipboard(m.content, m._id)}
                        className="hover:text-teal-600 flex items-center gap-1"
                      >
                        {copiedId === m._id ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>

                      <button
                        onClick={() => feedbackMessage(m._id, m.feedback === 'like' ? null : 'like')}
                        className={`hover:text-teal-600 flex items-center gap-1 ${
                          m.feedback === 'like' ? 'text-teal-600 font-bold' : ''
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => feedbackMessage(m._id, m.feedback === 'dislike' ? null : 'dislike')}
                        className={`hover:text-rose-600 flex items-center gap-1 ${
                          m.feedback === 'dislike' ? 'text-rose-600 font-bold' : ''
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => sendMessage(messages[messages.length - 2]?.content || 'Explain further')}
                        className="hover:text-sky-600 flex items-center gap-1 ml-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Regenerate
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Streaming Text display */}
          {streamingText && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 mt-1 shadow">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 max-w-xl whitespace-pre-wrap">
                {streamingText}
                <span className="inline-block w-2 h-4 bg-teal-600 ml-1 animate-pulse" />
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {sending && !streamingText && (
            <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse pl-11">
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
              <span>HealthSphere AI is generating clinical response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-xs text-teal-800 dark:text-teal-300 w-fit">
              {selectedFile.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span className="font-bold">{selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)} className="text-rose-500 hover:text-rose-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              title="Upload Image / PDF Report"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              rows={1}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask HealthSphere AI anything about your symptoms, medications, or reports..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />

            <Button
              onClick={handleSend}
              disabled={sending || (!inputContent.trim() && !selectedFile)}
              size="icon"
              className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSendVoiceQuery={(query) => {
          sendMessage(query);
          setIsVoiceOpen(false);
        }}
        latestResponseText={messages[messages.length - 1]?.sender === 'assistant' ? messages[messages.length - 1].content : ''}
      />

      {/* Global AI Search Modal */}
      <GlobalAISearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
