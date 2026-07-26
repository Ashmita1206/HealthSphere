import { memo } from 'react';
import { TIMELINE_EVENT_CONFIG } from './timelineConstants';
import type { TimelineEvent } from './timelineTypes';

interface TimelineConnectorProps {
  event: TimelineEvent;
  isLast: boolean;
}

export const TimelineConnector = memo(function TimelineConnector({
  event,
  isLast,
}: TimelineConnectorProps) {
  const visual = TIMELINE_EVENT_CONFIG[event.type];
  const animated =
    event.priority === 'critical' ||
    event.status === 'critical' ||
    event.status === 'upcoming';

  return (
    <div
      className="absolute bottom-0 left-3 top-0 flex w-5 justify-center sm:left-5"
      aria-hidden="true"
    >
      {!isLast && (
        <span className="absolute bottom-[-1.25rem] top-6 w-px bg-gradient-to-b from-slate-300 to-slate-200" />
      )}
      <span
        className={`relative mt-5 h-3.5 w-3.5 rounded-full ring-4 ${visual.nodeClass}`}
      >
        {animated && (
          <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-25" />
        )}
      </span>
    </div>
  );
});
