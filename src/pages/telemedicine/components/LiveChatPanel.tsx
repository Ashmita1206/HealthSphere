import React, { useState } from 'react';
import { Send, MessageSquare, Bot } from 'lucide-react';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'doctor' | 'patient' | 'system';
  message: string;
  timestamp: string;
}

export interface LiveChatPanelProps {
  initialMessages?: ChatMessage[];
  isOtherTyping?: boolean;
  onSendMessage?: (msg: string) => void;
  className?: string;
}

export const DEFAULT_TELEMEDICINE_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderName: 'System',
    senderRole: 'system',
    message: 'Encrypted consultation channel established. All data is HIPAA & DISHA compliant.',
    timestamp: '10:00 AM',
  },
  {
    id: 'msg-2',
    senderName: 'Dr. Vikramaditya Sen',
    senderRole: 'doctor',
    message: 'Good morning Aarav. I see your blood pressure readings spiked slightly last night. Are you feeling any chest pressure or headache?',
    timestamp: '10:02 AM',
  },
  {
    id: 'msg-3',
    senderName: 'Aarav Sharma',
    senderRole: 'patient',
    message: 'Hello Doctor, yes, slight headache around 9 PM after dinner. No acute chest pain.',
    timestamp: '10:03 AM',
  },
];

export const LiveChatPanel: React.FC<LiveChatPanelProps> = ({
  initialMessages = DEFAULT_TELEMEDICINE_MESSAGES,
  isOtherTyping = false,
  onSendMessage,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'You',
      senderRole: 'patient',
      message: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    if (onSendMessage) onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div
      data-testid="live-chat-panel"
      className={`flex flex-col h-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Live Consultation Chat
          </h4>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          Encrypted Session
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[220px]">
        {messages.map((msg) => {
          const isDoctor = msg.senderRole === 'doctor';
          const isSystem = msg.senderRole === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center text-[10px] text-slate-500 font-medium"
              >
                {msg.message}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isDoctor ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {msg.senderName}
                </span>
                <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
              </div>
              <div
                className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                  isDoctor
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                    : 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isOtherTyping && (
          <div className="flex items-center gap-2 text-slate-500 text-xs italic pt-1">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span className="text-[11px]">Doctor is typing clinical notes...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-850"
      >
        <input
          type="text"
          placeholder="Type message to doctor..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
        />
        <button
          type="submit"
          aria-label="Send consultation message"
          className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
