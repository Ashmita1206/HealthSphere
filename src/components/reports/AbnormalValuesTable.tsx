import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface AbnormalBiomarker {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'Critical' | 'Elevated' | 'Low' | string;
  clinicalNote: string;
}

export interface AbnormalValuesTableProps {
  abnormalValues?: AbnormalBiomarker[];
  className?: string;
}

// Retained for test fixture typing only; never used as a component default
export const DEFAULT_ABNORMAL_VALUES: AbnormalBiomarker[] = [];

export const AbnormalValuesTable: React.FC<AbnormalValuesTableProps> = ({
  abnormalValues = [],
  className = '',
}) => {
  if (!abnormalValues || abnormalValues.length === 0) {
    return (
      <div
        data-testid="abnormal-values-empty"
        className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-2.5 ${className}`}
      >
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            No Abnormal Biomarkers Flagged
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            All extracted physiological parameters fall within standard physiological reference intervals, or no diagnostic report has been uploaded for analysis yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="abnormal-values-table"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Highlighted Abnormal Biomarkers ({abnormalValues.length})
            </h3>
            <p className="text-xs text-slate-500">Parameters breaching standard physiological reference intervals</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
          Clinical Review Indicated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
              <th className="pb-3">Biomarker</th>
              <th className="pb-3">Measured Value</th>
              <th className="pb-3">Reference Range</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Clinical Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {abnormalValues.map((item, idx) => {
              const isCritical = String(item.status).toLowerCase() === 'critical';
              const isLow = String(item.status).toLowerCase() === 'low';
              const badgeStyle = isCritical
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
                : isLow
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';

              return (
                <tr key={`${item.name}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="py-3 font-bold text-rose-600 dark:text-rose-400">
                    {item.value} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">{item.normalRange}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                      {String(item.status).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">
                    {item.clinicalNote}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
