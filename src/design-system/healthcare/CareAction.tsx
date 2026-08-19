import React from 'react';
import { Clock, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CareActionProps {
  title: string;
  timeText: string;
  contextNote?: string;
  isCompleted?: boolean;
  onToggle?: () => void;
  type?: 'medication' | 'appointment' | 'vitals';
}

export const CareAction: React.FC<CareActionProps> = ({
  title,
  timeText,
  contextNote,
  isCompleted = false,
  onToggle,
  type = 'medication',
}) => {
  return (
    <div
      onClick={onToggle}
      className={cn(
        'group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none',
        isCompleted
          ? 'bg-slate-50/80 border-slate-200 text-slate-500'
          : 'bg-white border-slate-200/80 text-slate-900 hover:border-teal-700/50 hover:shadow-xs'
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0',
            isCompleted ? 'text-emerald-600' : 'text-slate-300 group-hover:text-teal-700'
          )}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-100 text-emerald-700" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="space-y-0.5">
          <p className={cn('text-xs font-bold transition-colors', isCompleted && 'line-through text-slate-400')}>
            {title}
          </p>
          {contextNote && <p className="text-[11px] text-slate-500 leading-none">{contextNote}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{timeText}</span>
      </div>
    </div>
  );
};
