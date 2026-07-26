import { memo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TimelineDateGroup } from './TimelineDateGroup';
import type {
  TimelineDateGroupData,
  TimelineEvent,
  TimelineViewMode,
} from './timelineTypes';

interface TimelineContainerProps {
  groups: TimelineDateGroupData[];
  viewMode: TimelineViewMode;
  onOpenEvent: (event: TimelineEvent) => void;
}

const ITEMS_PER_PAGE = 20;

export const TimelineContainer = memo(function TimelineContainer({
  groups,
  viewMode,
  onOpenEvent,
}: TimelineContainerProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Flatten all events for pagination
  const allEvents = groups.flatMap((group) => group.events);
  const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE);

  const paginatedEvents = allEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Regroup paginated events by their original group labels
  const paginatedGroups = groups
    .map((group) => ({
      ...group,
      events: group.events.filter((event) => paginatedEvents.includes(event)),
    }))
    .filter((group) => group.events.length > 0);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div
      className="min-w-0 space-y-7"
      aria-label="Health timeline events"
      aria-live="polite"
    >
      {paginatedGroups.map((group) => (
        <TimelineDateGroup
          key={group.label}
          group={group}
          viewMode={viewMode}
          onOpenEvent={onOpenEvent}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="h-8 text-xs font-bold rounded-lg"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                type="button"
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`h-8 w-8 text-xs font-bold rounded-lg ${
                  page === currentPage
                    ? 'bg-teal-700 hover:bg-teal-800 text-white'
                    : 'border-slate-200 text-slate-700'
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-8 text-xs font-bold rounded-lg"
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}

      <div className="text-center text-xs text-slate-500">
        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, allEvents.length)} of {allEvents.length} events
      </div>
    </div>
  );
});
