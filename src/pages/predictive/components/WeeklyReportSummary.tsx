import React from 'react';
import { FileText, Download, Calendar, Sparkles, CheckCircle2, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WeeklyReportData {
  weekRange: string;
  confidenceScore: number; // e.g. 94.8%
  calibrationCohort: string;
  keyDeltas: { label: string; change: string; positive: boolean }[];
  summaryNarrative: string;
}

export const DEFAULT_WEEKLY_REPORT: WeeklyReportData = {
  weekRange: 'Week of Aug 25 - Aug 31, 2026',
  confidenceScore: 94.8,
  calibrationCohort: '12,480 Longitudinal Patient EHRs',
  keyDeltas: [
    { label: 'AI Health Index', change: '+3.2 pts (78 -> 81)', positive: true },
    { label: 'Hospitalization Risk', change: '-2.4% (18% -> 15.6%)', positive: true },
    { label: 'Glycemic Variance', change: '-14 mg/dL stability', positive: true },
    { label: 'Sleep Consistency', change: '+45 mins restorative', positive: true },
  ],
  summaryNarrative:
    'Patient has demonstrated improved post-meal glycemic stability and adherence to morning pharmacological protocol. Predictive model forecasts a 0.4% HbA1c reduction over the next 90 days if Zone 2 exercise consistency is maintained.',
};

export const WeeklyReportSummary: React.FC<{
  report?: WeeklyReportData;
  onDownload?: () => void;
  className?: string;
}> = ({ report = DEFAULT_WEEKLY_REPORT, onDownload, className = '' }) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HealthSphere_Weekly_Report_${report.weekRange.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      data-testid="weekly-report-summary"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Weekly Predictive Intelligence Report
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {report.confidenceScore}% AI Confidence
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {report.weekRange} • Calibrated on {report.calibrationCohort}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleDownload}
          className="h-9 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Weekly Report</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {report.keyDeltas.map((d) => (
          <div
            key={d.label}
            className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {d.label}
            </p>
            <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{d.change}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Clinical AI Predictive Synthesis</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {report.summaryNarrative}
        </p>
      </div>
    </div>
  );
};
