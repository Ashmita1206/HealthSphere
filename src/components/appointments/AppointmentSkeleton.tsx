import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const AppointmentSkeleton = memo(function AppointmentSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded-lg w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="h-3 bg-slate-100 rounded-lg w-1/3 animate-pulse" />
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
              <div className="h-8 bg-slate-100 rounded-lg w-8 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
