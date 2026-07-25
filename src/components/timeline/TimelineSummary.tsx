import { memo } from 'react';
import { Activity, Clock3, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatTimelineDate, formatTimelineTime } from './timelineHelpers';
import type { TimelineEvent } from './timelineTypes';

interface TimelineSummaryProps {
  latestEvent: TimelineEvent | null;
  visibleCount: number;
  activeFilterCount: number;
}

export const TimelineSummary = memo(function TimelineSummary({
  latestEvent,
  visibleCount,
  activeFilterCount,
}: TimelineSummaryProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-teal-800 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white shadow-lg sm:p-7">
      <div
        className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-teal-400/10"
        aria-hidden="true"
      />
      <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <Badge className="mb-3 border-white/15 bg-white/10 text-teal-100 hover:bg-white/10">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Longitudinal Health Record
          </Badge>
          <h2 className="text-xl font-extrabold font-heading sm:text-2xl">
            Your complete clinical journey, in one place
          </h2>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-teal-100/90 sm:text-sm">
            Review medicines, appointments, reports, vitals, alerts, and
            patient-reported activity as a single chronological record.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-teal-100">
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-teal-300" />
              {visibleCount} visible {visibleCount === 1 ? 'event' : 'events'}
            </span>
            {activeFilterCount > 0 && (
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                {activeFilterCount} active{' '}
                {activeFilterCount === 1 ? 'filter' : 'filters'}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm lg:w-72">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-teal-200">
            <Clock3 className="h-3.5 w-3.5" />
            Latest visible activity
          </div>
          {latestEvent ? (
            <>
              <p className="mt-2 truncate text-sm font-extrabold">
                {latestEvent.title}
              </p>
              <p className="mt-1 text-xs text-teal-100/80">
                {formatTimelineDate(latestEvent.timestamp)} at{' '}
                {formatTimelineTime(latestEvent.timestamp)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-teal-100/80">
              No activity matches the current view.
            </p>
          )}
        </div>
      </div>
    </section>
  );
});
