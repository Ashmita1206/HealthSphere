import { memo, useEffect, useState } from 'react';
import { Activity, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TimelineExport } from './TimelineExport';
import type { TimelineEvent } from './timelineTypes';

interface TimelineHeaderProps {
  events: TimelineEvent[];
  totalRecords?: number;
  upcomingCount?: number;
  healthScore?: number;
}

function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setDisplayValue(Math.floor(progress * (endValue - startValue) + startValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export const TimelineHeader = memo(function TimelineHeader({
  events,
  totalRecords = events.length,
  upcomingCount = 0,
  healthScore = 85,
}: TimelineHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
      {/* Decorative ambient glows */}
      <div
        className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-teal-400/30 bg-teal-500/15 text-teal-200 hover:bg-teal-500/20">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-teal-400" />
              Longitudinal Clinical Record
            </Badge>
            <Badge className="border-cyan-400/30 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/20">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
              Realtime Sync
            </Badge>
          </div>

          <h1 className="text-2xl font-extrabold font-heading text-white sm:text-3xl lg:text-4xl">
            Health Timeline
          </h1>

          <p className="max-w-2xl text-xs leading-relaxed text-slate-300 sm:text-sm">
            A continuous, longitudinal record of medical appointments, prescriptions, diagnostic laboratory reports, vitals, vaccinations, and patient-reported health updates.
          </p>

          {/* Animated counter pills */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <Activity className="h-4 w-4 text-teal-400" aria-hidden="true" />
              <span className="text-slate-300 font-medium">Total Records:</span>
              <strong className="text-sm font-extrabold text-white">
                <AnimatedCounter value={totalRecords} />
              </strong>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <span className="text-slate-300 font-medium">Upcoming:</span>
              <strong className="text-sm font-extrabold text-white">
                <AnimatedCounter value={upcomingCount} />
              </strong>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <Heart className="h-4 w-4 text-rose-400" aria-hidden="true" />
              <span className="text-slate-300 font-medium">Health Score:</span>
              <strong className="text-sm font-extrabold text-white">
                <AnimatedCounter value={healthScore} />
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </strong>
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-2 lg:pt-0">
          <TimelineExport events={events} />
        </div>
      </div>
    </header>
  );
});
