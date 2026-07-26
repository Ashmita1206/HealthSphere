import { memo } from 'react';
import { CalendarX2, FilterX, ListRestart, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TimelineEmptyReason } from './timelineTypes';

interface TimelineEmptyStateProps {
  reason: TimelineEmptyReason;
  onReset: () => void;
}

const content = {
  'no-events': {
    icon: ListRestart,
    title: 'No health events yet',
    description:
      'Timeline events will appear here as connected health modules provide activity.',
    action: 'Refresh Timeline',
  },
  search: {
    icon: SearchX,
    title: 'No search results',
    description:
      'No event matches your search. Try another doctor, medicine, report, or keyword.',
    action: 'Clear Search',
  },
  filter: {
    icon: FilterX,
    title: 'No events match these filters',
    description:
      'Adjust the selected event categories or sort settings to see more activity.',
    action: 'Clear Filters',
  },
  'date-range': {
    icon: CalendarX2,
    title: 'No events in this date range',
    description:
      'Choose another date range or return to All Time to review the full record.',
    action: 'Show All Time',
  },
} satisfies Record<
  TimelineEmptyReason,
  {
    icon: typeof ListRestart;
    title: string;
    description: string;
    action: string;
  }
>;

export const TimelineEmptyState = memo(function TimelineEmptyState({
  reason,
  onReset,
}: TimelineEmptyStateProps) {
  const state = content[reason];
  const EmptyIcon = state.icon;

  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700">
          <EmptyIcon className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-slate-900">
          {state.title}
        </h2>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
          {state.description}
        </p>
        <Button
          type="button"
          onClick={onReset}
          className="mt-5 rounded-xl bg-teal-700 px-5 text-xs font-bold text-white hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          {state.action}
        </Button>
      </CardContent>
    </Card>
  );
});
