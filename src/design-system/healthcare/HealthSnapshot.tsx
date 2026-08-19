import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';

export interface HealthSnapshotProps {
  userName?: string;
  overallScore?: number;
  statusLabel?: string;
  narrativeText?: string;
  trendText?: string;
}

export const HealthSnapshot: React.FC<HealthSnapshotProps> = ({
  userName = 'Alex',
  overallScore = 82,
  statusLabel = 'Optimal Standing',
  narrativeText = 'Your blood pressure and medication adherence have remained steady this week.',
  trendText = '+2% from last week',
}) => {
  return (
    <Card variant="base" padding="lg" className="border-slate-200/80 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <Badge variant="healthy" className="mb-1">
            {statusLabel}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 font-editorial">
            Good morning, <span className="font-semibold">{userName}</span>.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">{narrativeText}</p>
        </div>

        <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-2xl border border-slate-200/80 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Index</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums font-mono">
                {overallScore}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 100</span>
            </div>
            {trendText && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{trendText}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
