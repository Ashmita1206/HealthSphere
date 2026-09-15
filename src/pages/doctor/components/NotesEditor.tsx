import React, { useState } from 'react';
import { FileEdit, Save, Check } from 'lucide-react';

export interface SOAPNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface NotesEditorProps {
  initialNotes?: Partial<SOAPNotes>;
  onSave?: (notes: SOAPNotes) => void;
  className?: string;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  initialNotes = {},
  onSave,
  className = '',
}) => {
  const [notes, setNotes] = useState<SOAPNotes>({
    subjective:
      initialNotes.subjective ||
      'Patient reports occasional evening palpitations and headache for the past 5 days.',
    objective:
      initialNotes.objective ||
      'Resting BP 138/88 mmHg, Pulse 82 bpm regular. S1/S2 heard clearly, no pedal edema.',
    assessment:
      initialNotes.assessment ||
      'Stage 1 Essential Hypertension with suboptimal control; lifestyle and medication review indicated.',
    plan:
      initialNotes.plan ||
      '1. Titrate Telmisartan to 40mg daily.\n2. Order 24-hr ambulatory BP monitoring.\n3. Low sodium DASH diet.\n4. Follow-up in 2 weeks.',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (onSave) onSave(notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      data-testid="notes-editor"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <FileEdit className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Clinical SOAP Notes Editor
          </h3>
        </div>

        <button
          onClick={handleSave}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved' : 'Save Notes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subjective */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] flex items-center justify-center font-bold">
              S
            </span>
            <span>Subjective (Symptoms & History)</span>
          </label>
          <textarea
            aria-label="Subjective (Symptoms & History)"
            value={notes.subjective}
            onChange={(e) => setNotes({ ...notes, subjective: e.target.value })}
            rows={3}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-200 resize-none"
          />
        </div>

        {/* Objective */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] flex items-center justify-center font-bold">
              O
            </span>
            <span>Objective (Exam & Vitals)</span>
          </label>
          <textarea
            aria-label="Objective (Exam & Vitals)"
            value={notes.objective}
            onChange={(e) => setNotes({ ...notes, objective: e.target.value })}
            rows={3}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-200 resize-none"
          />
        </div>

        {/* Assessment */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] flex items-center justify-center font-bold">
              A
            </span>
            <span>Assessment (Diagnosis & Impression)</span>
          </label>
          <textarea
            aria-label="Assessment (Diagnosis & Impression)"
            value={notes.assessment}
            onChange={(e) => setNotes({ ...notes, assessment: e.target.value })}
            rows={3}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-200 resize-none"
          />
        </div>

        {/* Plan */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] flex items-center justify-center font-bold">
              P
            </span>
            <span>Plan (Therapy & Follow-up)</span>
          </label>
          <textarea
            aria-label="Plan (Therapy & Follow-up)"
            value={notes.plan}
            onChange={(e) => setNotes({ ...notes, plan: e.target.value })}
            rows={3}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 text-slate-800 dark:text-slate-200 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
