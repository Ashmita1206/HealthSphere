import { Card, CardContent } from '@/components/ui/card';

export function MedicineSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
                <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
                <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
