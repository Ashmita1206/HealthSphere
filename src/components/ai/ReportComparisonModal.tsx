import React from 'react';
import { ReportComparisonResult } from '@/services/ai/aiService';
import { X, ArrowRightLeft, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ReportComparisonResult | null;
}

export const ReportComparisonModal: React.FC<ReportComparisonModalProps> = ({ isOpen, onClose, result }) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-6 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white font-heading">
              Report Comparison Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overall Clinical Trend: <span className="font-bold text-teal-600 dark:text-teal-400">{result.overallTrend}</span>
            </p>
          </div>
        </div>

        {/* Summary box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {result.summary}
        </div>

        {/* Key changes list */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            Key Biomarker Variations
          </h4>
          <div className="space-y-2">
            {Array.isArray(result.keyChanges) &&
              result.keyChanges.map((change, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{typeof change.metric === 'object' ? JSON.stringify(change.metric) : String(change.metric || '')}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{typeof change.explanation === 'object' ? JSON.stringify(change.explanation) : String(change.explanation || '')}</p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400 line-through">{typeof change.previousValue === 'object' ? JSON.stringify(change.previousValue) : String(change.previousValue || '')}</span>
                    <span>&rarr;</span>
                    <span className="font-bold text-slate-900 dark:text-white">{typeof change.currentValue === 'object' ? JSON.stringify(change.currentValue) : String(change.currentValue || '')}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      change.status === 'Improved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : change.status === 'Worsened'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {typeof change.status === 'object' ? JSON.stringify(change.status) : String(change.status || '')}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Actionable Advice */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            Recommendations
          </h4>
          <ul className="space-y-1.5">
            {Array.isArray(result.actionableAdvice) &&
              result.actionableAdvice.map((adv, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{typeof adv === 'object' ? JSON.stringify(adv) : String(adv || '')}</span>
                </li>
              ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
