import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Users,
  AlertCircle,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  Stethoscope,
  Shield,
  Flame,
} from 'lucide-react';
import { CareTeamThread, CareTeamMessage } from '../../services/collaborationService';

interface CareTeamThreadsProps {
  threads: CareTeamThread[];
  activeThread: CareTeamThread | null;
  onSelectThread: (thread: CareTeamThread) => void;
  onSendMessage: (threadId: string, content: string, urgency: 'routine' | 'urgent' | 'stat') => Promise<void>;
  onCreateThread: (payload: {
    patientName: string;
    caseTitle: string;
    department: string;
    urgency: 'routine' | 'urgent' | 'stat';
    initialMessage?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const CareTeamThreads: React.FC<CareTeamThreadsProps> = ({
  threads,
  activeThread,
  onSelectThread,
  onSendMessage,
  onCreateThread,
  isLoading = false,
}) => {
  const [messageText, setMessageText] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPatient, setNewPatient] = useState('');
  const [newDept, setNewDept] = useState('Emergency Medicine');
  const [newUrgency, setNewUrgency] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [newInitialMsg, setNewInitialMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !messageText.trim()) return;
    setIsSending(true);
    try {
      await onSendMessage(activeThread._id, messageText.trim(), urgency);
      setMessageText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onCreateThread({
      caseTitle: newTitle.trim(),
      patientName: newPatient.trim() || 'General Ward Patient',
      department: newDept,
      urgency: newUrgency,
      initialMessage: newInitialMsg.trim() || undefined,
    });
    setNewTitle('');
    setNewPatient('');
    setNewInitialMsg('');
    setShowCreateModal(false);
  };

  const getUrgencyBadge = (u: string) => {
    switch (u) {
      case 'stat':
        return {
          label: 'STAT / Critical',
          style: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
        };
      case 'urgent':
        return {
          label: 'Urgent',
          style: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      default:
        return {
          label: 'Routine',
          style: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        };
    }
  };

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Multi-Disciplinary Care Team Threads
            </h3>
            <p className="text-xs text-muted-foreground">Collaborative clinical case discussions & instant triage consults</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          New Case Thread
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Thread List Column */}
        <div className="lg:col-span-4 space-y-2 border-r border-border/20 pr-0 lg:pr-4 max-h-[520px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading care team discussions...</div>
          ) : threads.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No clinical discussions open. Click "New Case Thread" to start.
            </div>
          ) : (
            threads.map((thread) => {
              const isSelected = activeThread?._id === thread._id;
              const badge = getUrgencyBadge(thread.urgency);
              return (
                <div
                  key={thread._id}
                  onClick={() => onSelectThread(thread)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                    isSelected
                      ? 'bg-primary/10 border-primary/40 shadow-sm'
                      : 'bg-card/50 border-border/30 hover:bg-card/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-semibold text-foreground line-clamp-1">{thread.caseTitle}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium uppercase ${badge.style}`}>
                      {thread.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2">{thread.patientName} • {thread.department}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{thread.messages?.length || 0} messages</span>
                    <span>{new Date(thread.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Active Conversation Column */}
        <div className="lg:col-span-8 flex flex-col justify-between h-[520px]">
          {activeThread ? (
            <>
              {/* Thread Top Bar */}
              <div className="p-3 bg-muted/20 rounded-xl border border-border/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    {activeThread.caseTitle}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                      {activeThread.department}
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Patient: {activeThread.patientName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${getUrgencyBadge(activeThread.urgency).style}`}>
                    {activeThread.urgency.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 my-2">
                {activeThread.messages?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    No messages yet in this case. Send a clinical message below.
                  </div>
                ) : (
                  activeThread.messages.map((msg, i) => (
                    <motion.div
                      key={msg._id || i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl border border-border/30 bg-muted/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{msg.senderName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 capitalize">
                            {msg.senderRole}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {msg.urgency !== 'routine' && (
                            <span className="text-rose-400 font-semibold uppercase">{msg.urgency}</span>
                          )}
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <p className="text-foreground/90 text-[11px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Send Box */}
              <form onSubmit={handleSend} className="space-y-2 pt-2 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Urgency:</span>
                  {(['routine', 'urgent', 'stat'] as const).map((u) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setUrgency(u)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        urgency === u
                          ? u === 'stat'
                            ? 'bg-rose-500 text-white'
                            : u === 'urgent'
                            ? 'bg-amber-500 text-white'
                            : 'bg-primary text-primary-foreground'
                          : 'bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Enter clinical assessment or care recommendation..."
                    className="flex-1 bg-muted/30 border border-border/40 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !messageText.trim()}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/40 rounded-xl">
              <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <h4 className="text-sm font-semibold text-foreground mb-1">Select a Clinical Case Thread</h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                Choose an ongoing multidisciplinary discussion from the list or start a new case thread for your patient.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="font-semibold text-foreground text-sm">Initiate Multidisciplinary Case Thread</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground font-medium block mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Post-Op Cardiac Arrhythmia Management"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-muted/40 border border-border/40 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Patient Name / Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (Bed ICU-04)"
                  value={newPatient}
                  onChange={(e) => setNewPatient(e.target.value)}
                  className="w-full bg-muted/40 border border-border/40 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-muted/40 border border-border/40 rounded-xl px-2.5 py-2 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Intensive Care (ICU)">Intensive Care (ICU)</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Pulmonology">Pulmonology</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground font-medium block mb-1">Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full bg-muted/40 border border-border/40 rounded-xl px-2.5 py-2 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground font-medium block mb-1">Initial Clinical Note</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the core clinical question or triage summary..."
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  className="w-full bg-muted/40 border border-border/40 rounded-xl p-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                  Create Case Thread
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
