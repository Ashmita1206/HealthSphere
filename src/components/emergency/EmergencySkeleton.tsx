import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const EmergencySkeleton = memo(function EmergencySkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl border border-slate-200/80 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-20 animate-pulse" />
                  <div className="h-6 bg-slate-100 rounded w-12 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SOS Button Skeleton */}
      <div className="flex justify-center">
        <div className="w-48 h-48 rounded-full bg-slate-100 animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-2xl border border-slate-200/80 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
              </div>
              <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});
