import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Save,
  Clock,
  AlertTriangle,
  Users,
  Check,
  RefreshCw,
  History,
  Lock,
  Sparkles,
} from 'lucide-react';
import { SharedClinicalNote, ChartLock } from '../../services/collaborationService';
import { PatientLiveLockIndicator } from './PatientLiveLockIndicator';

interface SharedNotesEditorProps {
  note: SharedClinicalNote | null;
  activeLocks: ChartLock[];
  currentUserId?: string;
  onSaveNote: (payload: {
    noteId: string;
    baseVersion: number;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    forceOverwrite?: boolean;
  }) => Promise<void>;
  onAcquireLock: (field: string) => Promise<void>;
  onReleaseLock: (field: string) => Promise<void>;
  conflictState: {
    hasConflict: boolean;
    currentVersion: number;
    serverNote: SharedClinicalNote | null;
    message: string;
  } | null;
  onClearConflict: () => void;
  isLoading?: boolean;
}

export const SharedNotesEditor: React.FC<SharedNotesEditorProps> = ({
  note,
  activeLocks,
  currentUserId,
  onSaveNote,
  onAcquireLock,
  onReleaseLock,
  conflictState,
  onClearConflict,
  isLoading = false,
}) => {
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (note) {
      setSubjective(note.subjective || '');
      setObjective(note.objective || '');
      setAssessment(note.assessment || '');
      setPlan(note.plan || '');
    }
  }, [note?._id, note?.version]);

  const handleSave = async (forceOverwrite = false) => {
    if (!note) return;
    setIsSaving(true);
    try {
      await onSaveNote({
        noteId: note._id,
        baseVersion: note.version,
        subjective,
        objective,
        assessment,
        plan,
        forceOverwrite,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      // handled by parent conflict state
    } finally {
      setIsSaving(false);
    }
  };

  const getLockForField = (field: string) => {
    return activeLocks.find((l) => l.field === field) || null;
  };

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{note?.title || 'Collaborative Clinical Notes'}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                v{note?.version || 1}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Concurrent multi-disciplinary SOAP progress notes with conflict resolution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab(activeTab === 'editor' ? 'history' : 'editor')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            {activeTab === 'history' ? 'Back to Editor' : `Revisions (${note?.revisions?.length || 0})`}
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={isSaving || isLoading}
            className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saveSuccess ? 'Committed!' : 'Save & Commit'}
          </button>
        </div>
      </div>

      {/* Version Conflict Modal / Alert */}
      <AnimatePresence>
        {conflictState?.hasConflict && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs space-y-2">
                <div className="font-semibold text-rose-200">Concurrent Clinical Version Conflict Detected</div>
                <p>{conflictState.message}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (conflictState.serverNote) {
                        setSubjective(conflictState.serverNote.subjective || '');
                        setObjective(conflictState.serverNote.objective || '');
                        setAssessment(conflictState.serverNote.assessment || '');
                        setPlan(conflictState.serverNote.plan || '');
                      }
                      onClearConflict();
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-100 font-medium transition-colors"
                  >
                    Accept Remote Changes (v{conflictState.currentVersion})
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    className="px-3 py-1 rounded-lg bg-card/60 hover:bg-card border border-border/40 text-foreground font-medium transition-colors"
                  >
                    Force Overwrite (Break Lock)
                  </button>
                  <button
                    onClick={onClearConflict}
                    className="px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab content */}
      {activeTab === 'history' ? (
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Clinical Audit Revisions
          </h4>
          {note?.revisions && note.revisions.length > 0 ? (
            note.revisions.map((rev, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border/30 bg-muted/20 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-foreground">Version {rev.version}</span>
                  <span className="text-muted-foreground ml-2">by {rev.modifierName}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  {new Date(rev.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-6 text-center">No prior revisions recorded yet.</p>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {/* S - Subjective */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  S
                </span>
                Subjective (Patient Symptoms & History)
              </label>
            </div>
            <PatientLiveLockIndicator
              fieldName="subjective"
              fieldLabel="Subjective"
              currentUserId={currentUserId}
              activeLock={getLockForField('subjective')}
              onAcquireLock={onAcquireLock}
              onReleaseLock={onReleaseLock}
            />
            <textarea
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              rows={3}
              placeholder="Patient reports onset of symptoms, pain scale (1-10), aggravating/alleviating factors..."
              className="w-full bg-muted/30 border border-border/40 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          {/* O - Objective */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  O
                </span>
                Objective (Clinical Signs, Vitals & Diagnostics)
              </label>
            </div>
            <PatientLiveLockIndicator
              fieldName="objective"
              fieldLabel="Objective"
              currentUserId={currentUserId}
              activeLock={getLockForField('objective')}
              onAcquireLock={onAcquireLock}
              onReleaseLock={onReleaseLock}
            />
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={3}
              placeholder="Vital signs: BP, Pulse, Temp, SpO2; Physical examination findings, Lab telemetry..."
              className="w-full bg-muted/30 border border-border/40 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          {/* A - Assessment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                  A
                </span>
                Assessment (Clinical Impression & Differential Diagnosis)
              </label>
            </div>
            <PatientLiveLockIndicator
              fieldName="assessment"
              fieldLabel="Assessment"
              currentUserId={currentUserId}
              activeLock={getLockForField('assessment')}
              onAcquireLock={onAcquireLock}
              onReleaseLock={onReleaseLock}
            />
            <textarea
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              rows={3}
              placeholder="Differential diagnoses, clinical staging, risk trajectory, comorbidities..."
              className="w-full bg-muted/30 border border-border/40 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          {/* P - Plan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                  P
                </span>
                Plan (Therapeutics, Diagnostics, Consults & Discharge)
              </label>
            </div>
            <PatientLiveLockIndicator
              fieldName="plan"
              fieldLabel="Plan"
              currentUserId={currentUserId}
              activeLock={getLockForField('plan')}
              onAcquireLock={onAcquireLock}
              onReleaseLock={onReleaseLock}
            />
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              rows={3}
              placeholder="Medications ordered, diagnostic imaging scheduled, specialty referrals, patient instructions..."
              className="w-full bg-muted/30 border border-border/40 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
