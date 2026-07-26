import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TimelineSkeleton = memo(function TimelineSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading health timeline" role="status">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={`timeline-stat-skeleton-${index}`}
            className="h-20 rounded-2xl"
          />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`timeline-card-skeleton-${index}`}
            className="relative pl-10 sm:pl-14"
          >
            <span className="absolute left-4 top-0 h-full w-px bg-slate-200 sm:left-6" />
            <span className="absolute left-[11px] top-6 h-3 w-3 rounded-full bg-slate-200 sm:left-[19px]" />
            <Card className="rounded-2xl border-slate-200 shadow-none">
              <CardContent className="space-y-3 p-5">
                <div className="flex gap-3">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-7 w-2/3" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading timeline events</span>
    </div>
  );
});
