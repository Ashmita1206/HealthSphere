import React from 'react';
import { Clock, CheckCircle2, Video, Activity, FileText, Pill } from 'lucide-react';

export interface TimelineMilestone {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface ConsultationTimelineProps {
  milestones?: TimelineMilestone[];
  className?: string;
}

export const DEFAULT_CONSULT_TIMELINE: TimelineMilestone[] = [
  {
    id: 'm-1',
    time: '10:00 AM',
    title: 'Consultation Session Connected',
    description: 'Encrypted WebRTC high-definition channel established.',
    icon: Video,
  },
  {
    id: 'm-2',
    time: '10:02 AM',
    title: 'Biometric Telemetry Ingested',
    description: 'Patient vitals: BP 138/88 mmHg, Resting HR 82 bpm, SpO2 98%.',
    icon: Activity,
  },
  {
    id: 'm-3',
    time: '10:08 AM',
    title: 'Clinical Assessment Documented',
    description: 'Provisional Diagnosis: Stage 1 Essential Hypertension with nocturnal headache.',
    icon: FileText,
  },
  {
    id: 'm-4',
    time: '10:12 AM',
    title: 'Digital Prescription Signed',
    description: 'Telmisartan 40mg and Metformin 500mg synced to patient profile.',
    icon: Pill,
  },
];

export const ConsultationTimeline: React.FC<ConsultationTimelineProps> = ({
  milestones = DEFAULT_CONSULT_TIMELINE,
  className = '',
}) => {
  return (
    <div
      data-testid="consultation-timeline"
      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Consultation Session Timeline
          </h4>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">Live Session Milestones</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {milestones.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative space-y-0.5">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-teal-50 dark:bg-slate-850 border border-teal-500 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Icon className="w-2.5 h-2.5" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">{item.time}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
