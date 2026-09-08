import React from 'react';
import {
  Pill,
  Calendar,
  FileText,
  Heart,
  AlertTriangle,
  Activity,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TimelineEventRecord, TimelineCategory } from '@/services/timelineService';

interface TimelineItemProps {
  event: TimelineEventRecord;
  onDelete?: (id: string) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ event, onDelete }) => {
  const getCategoryTheme = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'medicine':
        return {
          icon: Pill,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badgeBg: 'bg-emerald-100/80 text-emerald-800',
          label: 'Medicine',
        };
      case 'appointment':
        return {
          icon: Calendar,
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badgeBg: 'bg-blue-100/80 text-blue-800',
          label: 'Appointment',
        };
      case 'report':
        return {
          icon: FileText,
          bg: 'bg-violet-50',
          border: 'border-violet-200',
          text: 'text-violet-700',
          badgeBg: 'bg-violet-100/80 text-violet-800',
          label: 'Report',
        };
      case 'vitals':
        return {
          icon: Heart,
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badgeBg: 'bg-rose-100/80 text-rose-800',
          label: 'Vitals',
        };
      case 'emergency':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-100',
          border: 'border-rose-300',
          text: 'text-rose-800',
          badgeBg: 'bg-rose-200 text-rose-900',
          label: 'Emergency',
        };
      case 'health_goal':
      case 'health goals':
        return {
          icon: Sparkles,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badgeBg: 'bg-amber-100/80 text-amber-800',
          label: 'Health Goal',
        };
      default:
        return {
          icon: Activity,
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          text: 'text-teal-700',
          badgeBg: 'bg-teal-100/80 text-teal-800',
          label: 'General',
        };
    }
  };

  const theme = getCategoryTheme(event.category || event.eventType);
  const IconComponent = theme.icon;

  const formattedDate = (() => {
    const raw = event.createdAt || event.timestamp;
    if (!raw) return 'Recently';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  })();

  return (
    <div className="relative flex items-start gap-3 sm:gap-4 group">
      {/* Node / Icon */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${theme.bg} ${theme.border} ${theme.text} shadow-2xs z-10 transition-transform group-hover:scale-105`}
      >
        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Card Content */}
      <div className="flex-1 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badgeBg}`}
              >
                {theme.label}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{formattedDate}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">{event.title}</h4>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(event.id || event._id || '')}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all"
              title="Delete timeline event"
              aria-label="Delete timeline event"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
};
