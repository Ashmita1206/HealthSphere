import React from 'react';
import { Grid, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface HeatmapCell {
  ageGroup: string;
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

export const DEFAULT_HEATMAP_DATA: HeatmapCell[] = [
  { ageGroup: '18 - 35 Years', low: 2840, moderate: 420, high: 95, critical: 12 },
  { ageGroup: '36 - 50 Years', low: 3120, moderate: 1240, high: 380, critical: 45 },
  { ageGroup: '51 - 65 Years', low: 1890, moderate: 1950, high: 820, critical: 160 },
  { ageGroup: '65+ Years', low: 650, moderate: 1420, high: 1240, critical: 448 },
];

export const PopulationRiskHeatmap: React.FC<{
  data?: HeatmapCell[];
  className?: string;
}> = ({ data = DEFAULT_HEATMAP_DATA, className = '' }) => {
  return (
    <div
      data-testid="population-risk-heatmap"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cross-Demographic Clinical Risk Heatmap
            </h3>
            <p className="text-xs text-slate-500">
              Stratification of patient acuity by age cohort and composite physiological risk tier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            Low Risk
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            Moderate
          </span>
          <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300">
            High
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black">
            Critical
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3 font-extrabold">Age Cohort</th>
              <th className="py-2.5 px-3 font-extrabold text-emerald-600">Low Risk (80 - 100)</th>
              <th className="py-2.5 px-3 font-extrabold text-amber-600">Moderate (60 - 79)</th>
              <th className="py-2.5 px-3 font-extrabold text-orange-600">High Risk (40 - 59)</th>
              <th className="py-2.5 px-3 font-extrabold text-rose-600">Critical (&lt; 40)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row) => (
              <tr key={row.ageGroup} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                  {row.ageGroup}
                </td>
                <td className="py-3 px-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 font-mono font-bold">
                    {row.low.toLocaleString()} pts
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-mono font-bold">
                    {row.moderate.toLocaleString()} pts
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-orange-900 dark:text-orange-200 font-mono font-bold">
                    {row.high.toLocaleString()} pts
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 font-mono font-extrabold ring-1 ring-rose-500/20">
                    {row.critical.toLocaleString()} pts
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
