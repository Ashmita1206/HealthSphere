import React from 'react';
import { Calendar, FileText, Pill, Activity } from 'lucide-react';
import { Badge } from '../primitives/Badge';

export interface HealthTimelineEvent {
  id: string;
  date: string;
  title: string;
  category: 'report' | 'medicine' | 'vital' | 'appointment';
  description?: string;
}

export interface HealthTimelineProps {
  events: HealthTimelineEvent[];
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ events }) => {
  const categoryIcons = {
    report: <FileText className="w-3.5 h-3.5 text-emerald-700" />,
    medicine: <Pill className="w-3.5 h-3.5 text-amber-700" />,
    vital: <Activity className="w-3.5 h-3.5 text-teal-700" />,
    appointment: <Calendar className="w-3.5 h-3.5 text-teal-800" />,
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Node Icon Pin */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-teal-700 flex items-center justify-center shadow-xs z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-800" />
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-teal-700/40 transition-colors space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{event.date}</span>
              <Badge variant="info" icon={categoryIcons[event.category]} className="text-[10px] uppercase">
                {event.category}
              </Badge>
            </div>
            <h4 className="text-xs font-bold text-slate-900">{event.title}</h4>
            {event.description && <p className="text-xs text-slate-600">{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
