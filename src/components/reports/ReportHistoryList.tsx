import React from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';

export interface ReportHistoryItem {
  id: string;
  title: string;
  category: string;
  date: string;
  riskLevel: 'low' | 'moderate' | 'high';
  summary: string;
  fileUrl?: string;
}

export interface ReportHistoryListProps {
  reports?: ReportHistoryItem[];
  onViewReport?: (report: ReportHistoryItem) => void;
  onDownloadReport?: (report: ReportHistoryItem) => void;
  className?: string;
}

export const DEFAULT_REPORT_HISTORY: ReportHistoryItem[] = [
  {
    id: 'rep-01',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    category: 'Blood Chemistry',
    date: 'Aug 24, 2026',
    riskLevel: 'moderate',
    summary: 'Elevated HbA1c (7.8%) and LDL (164 mg/dL); renal profile intact.',
  },
  {
    id: 'rep-02',
    title: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    date: 'Jul 12, 2026',
    riskLevel: 'low',
    summary: 'Normal hemoglobin (14.2 g/dL), platelet count (260,000/mcL), and white blood cell count.',
  },
  {
    id: 'rep-03',
    title: '2D Echocardiogram & Doppler Flow Study',
    category: 'Cardiology',
    date: 'May 04, 2026',
    riskLevel: 'low',
    summary: 'Normal left ventricular systolic function (EF 60%). Mild concentric LV hypertrophy.',
  },
];

export const ReportHistoryList: React.FC<ReportHistoryListProps> = ({
  reports = DEFAULT_REPORT_HISTORY,
  onViewReport,
  onDownloadReport,
  className = '',
}) => {
  return (
    <div
      data-testid="report-history-list"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Diagnostic Report History ({reports.length})
            </h3>
            <p className="text-xs text-slate-500">Longitudinal archive of scanned and analyzed clinical documents</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
          Cloud Encrypted
        </span>
      </div>

      <div className="space-y-3">
        {reports.map((item) => {
          const isHigh = item.riskLevel === 'high';
          const isModerate = item.riskLevel === 'moderate';

          const badgeClasses = isHigh
            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
            : isModerate
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-teal-400 dark:hover:border-teal-600 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {item.title}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
                      {item.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {item.category} • Uploaded on {item.date}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 max-w-xl">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {onViewReport && (
                  <button
                    onClick={() => onViewReport(item)}
                    aria-label={`View analysis for ${item.title}`}
                    className="p-2 rounded-xl text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                {onDownloadReport && (
                  <button
                    onClick={() => onDownloadReport(item)}
                    aria-label={`Download ${item.title}`}
                    className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
