import { memo } from 'react';
import { CalendarDays } from 'lucide-react';
import { TimelineCard } from './TimelineCard';
import { TimelineConnector } from './TimelineConnector';
import type {
  TimelineDateGroupData,
  TimelineEvent,
  TimelineViewMode,
} from './timelineTypes';

interface TimelineDateGroupProps {
  group: TimelineDateGroupData;
  viewMode: TimelineViewMode;
  onOpenEvent: (event: TimelineEvent) => void;
}

export const TimelineDateGroup = memo(function TimelineDateGroup({
  group,
  viewMode,
  onOpenEvent,
}: TimelineDateGroupProps) {
  const isVertical = viewMode === 'vertical';
  const isCards = viewMode === 'cards';

  return (
    <section aria-labelledby={`timeline-group-${group.label.replace(/\s/g, '-')}`}>
      <div
        className="sticky top-0 z-20 mb-3 flex items-center gap-2 border-y border-slate-200/80 bg-slate-50/95 px-3 py-2 backdrop-blur-sm"
      >
        <CalendarDays className="h-4 w-4 text-teal-700" aria-hidden="true" />
        <h2
          id={`timeline-group-${group.label.replace(/\s/g, '-')}`}
          className="text-xs font-extrabold uppercase tracking-wider text-slate-700"
        >
          {group.label}
        </h2>
        <span className="text-[10px] font-semibold text-slate-400">
          {group.events.length}{' '}
          {group.events.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div
        className={
          isCards
            ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'
            : 'space-y-3'
        }
      >
        {group.events.map((event, index) => (
          <div
            key={event.id}
            className={isVertical ? 'relative pl-10 sm:pl-14' : ''}
          >
            {isVertical && (
              <TimelineConnector
                event={event}
                isLast={index === group.events.length - 1}
              />
            )}
            <TimelineCard
              event={event}
              viewMode={viewMode}
              onOpen={onOpenEvent}
            />
          </div>
        ))}
      </div>
    </section>
  );
});
