import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Stethoscope,
  Activity,
  FileEdit,
  Radio,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  collaborationService,
  StaffPresence,
  CareTeamThread,
  SharedClinicalNote,
  ChartLock,
} from '../../services/collaborationService';
import { DoctorPresenceList } from '../../components/collaboration/DoctorPresenceList';
import { SharedNotesEditor } from '../../components/collaboration/SharedNotesEditor';
import { CareTeamThreads } from '../../components/collaboration/CareTeamThreads';

export const CareTeamWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [presenceList, setPresenceList] = useState<StaffPresence[]>([]);
  const [myStatus, setMyStatus] = useState<string>('available');
  const [threads, setThreads] = useState<CareTeamThread[]>([]);
  const [activeThread, setActiveThread] = useState<CareTeamThread | null>(null);
  const [sharedNote, setSharedNote] = useState<SharedClinicalNote | null>(null);
  const [activeLocks, setActiveLocks] = useState<ChartLock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conflictState, setConflictState] = useState<{
    hasConflict: boolean;
    currentVersion: number;
    serverNote: SharedClinicalNote | null;
    message: string;
  } | null>(null);

  // Initial load
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [presenceRes, threadsRes, noteRes] = await Promise.all([
        collaborationService.getStaffPresence().catch(() => ({ success: false, presenceList: [] })),
        collaborationService.getThreads().catch(() => ({ success: false, count: 0, threads: [] })),
        collaborationService.getSharedNote('global').catch(() => ({
          success: false,
          note: {
            _id: 'default-note-1',
            title: 'Multidisciplinary Rounds Clinical Note',
            category: 'SOAP' as const,
            subjective: 'Patient reports mild shortness of breath upon exertion.',
            objective: 'Vitals: BP 120/80 mmHg, HR 72 bpm, SpO2 99%.',
            assessment: 'Stable respiratory recovery post mild bronchial infection.',
            plan: 'Continue bronchodilator PRN, re-evaluate spirometry next week.',
            version: 1,
            revisions: [],
            updatedAt: new Date().toISOString(),
          } as unknown as SharedClinicalNote,
          activeLocks: [],
        })),
      ]);

      if (presenceRes.success && presenceRes.presenceList.length > 0) {
        setPresenceList(presenceRes.presenceList);
      } else {
        // Fallback default demonstration staff presence if offline/empty
        setPresenceList([
          {
            userId: 'doc-1',
            name: 'Dr. Sarah Jenkins, MD',
            role: 'doctor',
            department: 'Cardiology',
            status: 'available',
            lastSeen: new Date().toISOString(),
            activeConnections: 1,
          },
          {
            userId: 'doc-2',
            name: 'Dr. Marcus Vance, MD',
            role: 'doctor',
            department: 'Emergency Medicine',
            status: 'in_consultation',
            lastSeen: new Date().toISOString(),
            activeConnections: 1,
          },
          {
            userId: 'nurse-1',
            name: 'Nurse Elena Rostova, RN',
            role: 'nurse',
            department: 'Intensive Care (ICU)',
            status: 'rounding',
            lastSeen: new Date().toISOString(),
            activeConnections: 1,
          },
        ]);
      }

      if (threadsRes.success && threadsRes.threads.length > 0) {
        setThreads(threadsRes.threads);
        setActiveThread(threadsRes.threads[0]);
      } else {
        // Default initial threads
        const sampleThreads: CareTeamThread[] = [
          {
            _id: 'case-icu-01',
            caseTitle: 'Acute STEMI Telemetry Monitoring & Stent Follow-up',
            patientName: 'Robert Vance (Bed ICU-02)',
            department: 'Cardiology',
            urgency: 'stat',
            status: 'active',
            members: [
              { name: 'Dr. Sarah Jenkins', role: 'doctor', department: 'Cardiology' },
              { name: 'Elena Rostova', role: 'nurse', department: 'ICU' },
            ],
            messages: [
              {
                _id: 'm-1',
                senderName: 'Dr. Sarah Jenkins',
                senderRole: 'doctor',
                content: 'Post-angioplasty troponin levels trending down. Continue dual antiplatelet therapy.',
                urgency: 'stat',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
              },
              {
                _id: 'm-2',
                senderName: 'Elena Rostova',
                senderRole: 'nurse',
                content: 'Continuous telemetry active. Sinus rhythm maintained with no ST segment elevation.',
                urgency: 'routine',
                createdAt: new Date(Date.now() - 1800000).toISOString(),
              },
            ],
            lastActivityAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];
        setThreads(sampleThreads);
        setActiveThread(sampleThreads[0]);
      }

      if (noteRes.note) {
        setSharedNote(noteRes.note);
        setActiveLocks(noteRes.activeLocks || []);
      }
    } catch {
      // Keep UI responsive
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Presence change handler
  const handleStatusChange = async (newStatus: string) => {
    setMyStatus(newStatus);
    try {
      await collaborationService.updatePresence(newStatus);
      // update self in list
      setPresenceList((prev) =>
        prev.map((p) =>
          p.userId === user?.id
            ? { ...p, status: newStatus as any, lastSeen: new Date().toISOString() }
            : p
        )
      );
    } catch {
      // offline handling
    }
  };

  // Lock handlers
  const handleAcquireLock = async (field: string) => {
    try {
      const patientId = sharedNote?.patientId || 'global';
      const res = await collaborationService.acquireLock(patientId, field);
      if (res.acquired && res.lock) {
        setActiveLocks((prev) => [...prev.filter((l) => l.field !== field), res.lock!]);
      }
    } catch {
      // Handled
    }
  };

  const handleReleaseLock = async (field: string) => {
    try {
      const patientId = sharedNote?.patientId || 'global';
      await collaborationService.releaseLock(patientId, field);
      setActiveLocks((prev) => prev.filter((l) => l.field !== field));
    } catch {
      // Handled
    }
  };

  // Save Note handler with conflict resolution
  const handleSaveNote = async (payload: {
    noteId: string;
    baseVersion: number;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    forceOverwrite?: boolean;
  }) => {
    try {
      const res = await collaborationService.updateSharedNote(payload.noteId, payload);
      if (res.success && res.note) {
        setSharedNote(res.note);
        setConflictState(null);
      }
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        const d = err.response.data;
        setConflictState({
          hasConflict: true,
          currentVersion: d.currentVersion,
          serverNote: d.serverNote,
          message: d.message || 'Remote clinician made changes since you loaded this note.',
        });
      } else {
        // Local optimistic update fallback
        if (sharedNote) {
          setSharedNote({
            ...sharedNote,
            subjective: payload.subjective,
            objective: payload.objective,
            assessment: payload.assessment,
            plan: payload.plan,
            version: sharedNote.version + 1,
            revisions: [
              ...(sharedNote.revisions || []),
              {
                version: sharedNote.version,
                modifierName: user?.name || 'Current Clinician',
                content: 'Updated note sections',
                timestamp: new Date().toISOString(),
              },
            ],
          });
        }
      }
    }
  };

  // Care team thread handlers
  const handleSendMessage = async (
    threadId: string,
    content: string,
    urgency: 'routine' | 'urgent' | 'stat'
  ) => {
    try {
      const res = await collaborationService.postMessage(threadId, content, urgency);
      if (res.success && res.thread) {
        setThreads((prev) => prev.map((t) => (t._id === threadId ? res.thread : t)));
        setActiveThread(res.thread);
      }
    } catch {
      // Optimistic message append
      if (activeThread && activeThread._id === threadId) {
        const newMsg = {
          _id: `msg-${Date.now()}`,
          senderName: user?.name || 'Dr. You',
          senderRole: user?.role || 'doctor',
          content,
          urgency,
          createdAt: new Date().toISOString(),
        };
        const updated = {
          ...activeThread,
          messages: [...(activeThread.messages || []), newMsg],
          lastActivityAt: new Date().toISOString(),
        };
        setActiveThread(updated);
        setThreads((prev) => prev.map((t) => (t._id === threadId ? updated : t)));
      }
    }
  };

  const handleCreateThread = async (payload: {
    patientName: string;
    caseTitle: string;
    department: string;
    urgency: 'routine' | 'urgent' | 'stat';
    initialMessage?: string;
  }) => {
    try {
      const res = await collaborationService.createThread(payload);
      if (res.success && res.thread) {
        setThreads((prev) => [res.thread, ...prev]);
        setActiveThread(res.thread);
      }
    } catch {
      // Local fallback
      const newThread: CareTeamThread = {
        _id: `thread-${Date.now()}`,
        caseTitle: payload.caseTitle,
        patientName: payload.patientName,
        department: payload.department,
        urgency: payload.urgency,
        status: 'active',
        members: [{ name: user?.name || 'You', role: user?.role || 'doctor', department: payload.department }],
        messages: payload.initialMessage
          ? [
              {
                senderName: user?.name || 'You',
                senderRole: user?.role || 'doctor',
                content: payload.initialMessage,
                urgency: payload.urgency,
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThread(newThread);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-indigo-900/40 border border-border/40 p-8 backdrop-blur-xl shadow-lg"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              F36 Hospital Real-Time Collaboration
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Collaborative Healthcare Workspace
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Multi-disciplinary clinical care team coordination with live doctor presence, concurrent patient chart
              locking, real-time shared SOAP progress notes, and triage discussions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-card/60 hover:bg-card border border-border/50 text-foreground text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Workspace
            </button>
          </div>
        </div>
      </motion.div>

      {/* 1. Doctor & Clinical Staff Presence */}
      <DoctorPresenceList
        presenceList={presenceList}
        currentStatus={myStatus}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />

      {/* 2. Shared Clinical Notes & Live Chart Locks */}
      <SharedNotesEditor
        note={sharedNote}
        activeLocks={activeLocks}
        currentUserId={user?.id}
        onSaveNote={handleSaveNote}
        onAcquireLock={handleAcquireLock}
        onReleaseLock={handleReleaseLock}
        conflictState={conflictState}
        onClearConflict={() => setConflictState(null)}
        isLoading={isLoading}
      />

      {/* 3. Care Team Multidisciplinary Discussion Threads */}
      <CareTeamThreads
        threads={threads}
        activeThread={activeThread}
        onSelectThread={setActiveThread}
        onSendMessage={handleSendMessage}
        onCreateThread={handleCreateThread}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CareTeamWorkspace;
