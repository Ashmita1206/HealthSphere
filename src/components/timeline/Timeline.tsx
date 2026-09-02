import React, { useMemo } from 'react';
import { TimelineItem } from './TimelineItem';
import { Activity, Clock, CalendarDays, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { TimelineEventRecord } from '@/services/timelineService';

interface TimelineProps {
  events: TimelineEventRecord[];
  loading?: boolean;
  onDeleteEvent?: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  loading = false,
  onDeleteEvent,
}) => {
  // Group events by date period
  const groupedEvents = useMemo(() => {
    if (!events || events.length === 0) return {};

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const groups: Record<string, TimelineEventRecord[]> = {};

    events.forEach((evt) => {
      const d = new Date(evt.createdAt || evt.timestamp || Date.now());
      let groupKey = 'Earlier';

      if (!isNaN(d.getTime())) {
        if (d.toDateString() === todayStr) {
          groupKey = 'Today';
        } else if (d.toDateString() === yesterdayStr) {
          groupKey = 'Yesterday';
        } else {
          const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            groupKey = 'This Week';
          } else if (diffDays <= 30) {
            groupKey = 'This Month';
          } else {
            groupKey = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
          }
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(evt);
    });

    return groups;
  }, [events]);

  if (loading && (!events || events.length === 0)) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-3">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 font-heading">
          No Health Events Found
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          Your longitudinal timeline captures doctor visits, prescription updates, report analyses, and vitals.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      {/* Background vertical line track */}
      <div className="absolute top-4 bottom-4 left-[18px] sm:left-[20px] w-0.5 bg-slate-200/80 -z-0" />

      {Object.entries(groupedEvents).map(([groupTitle, groupItems]) => (
        <div key={groupTitle} className="space-y-4">
          <div className="flex items-center gap-2 pl-2">
            <CalendarDays className="w-3.5 h-3.5 text-teal-700" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-heading">
              {groupTitle}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {groupItems.length}
            </span>
          </div>

          <div className="space-y-4">
            {groupItems.map((item) => (
              <TimelineItem
                key={item.id || item._id}
                event={item}
                onDelete={onDeleteEvent}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
