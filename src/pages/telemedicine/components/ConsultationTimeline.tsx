import React from 'react';
import { Clock, Video, Activity, FileText, Pill } from 'lucide-react';

export interface TimelineMilestone {
  id: string;
  time: string;
  title: string;
  description: string;
  icon?: React.ElementType;
}

export interface ConsultationTimelineProps {
  milestones?: TimelineMilestone[];
  className?: string;
}

// Retained for test fixture typing only; never used as component default
export const DEFAULT_CONSULT_TIMELINE: TimelineMilestone[] = [];

export const ConsultationTimeline: React.FC<ConsultationTimelineProps> = ({
  milestones = [],
  className = '',
}) => {
  const hasMilestones = milestones && milestones.length > 0;

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

      {!hasMilestones ? (
        <div
          data-testid="consultation-timeline-empty"
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Session Initialized</p>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Clinical milestones, diagnostic notes, and session events will record chronologically as the consultation progresses.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {milestones.map((item) => {
            const Icon = item.icon || Clock;
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
      )}
    </div>
  );
};
