import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Apple, Stethoscope } from 'lucide-react';

export interface ReportRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  urgency: 'Immediate' | 'Within 1 Week' | 'Routine';
}

export interface ClinicalRecommendationsProps {
  recommendations?: ReportRecommendation[];
  onActionClick?: (rec: ReportRecommendation) => void;
  className?: string;
}

export const DEFAULT_REPORT_RECS: ReportRecommendation[] = [
  {
    id: 'rec-endo',
    category: 'Specialist Consultation',
    title: 'Consult Endocrinologist regarding HbA1c (7.8%)',
    description: 'Discuss potential adjustment of Metformin dosage or adjuvant GLP-1/SGLT2 therapy with your specialist.',
    urgency: 'Within 1 Week',
  },
  {
    id: 'rec-diet',
    category: 'Dietary Modification',
    title: 'Adopt Low-Glycemic Mediterranean Diet',
    description: 'Reduce refined carbohydrates and saturated fats to manage both fasting glucose and elevated LDL levels.',
    urgency: 'Routine',
  },
  {
    id: 'rec-retest',
    category: 'Follow-up Testing',
    title: 'Repeat Lipid & Renal Panel in 6 Weeks',
    description: 'Ensure serum creatinine normalizes and track response to dietary modifications.',
    urgency: 'Routine',
  },
];

export const ClinicalRecommendations: React.FC<ClinicalRecommendationsProps> = ({
  recommendations = DEFAULT_REPORT_RECS,
  onActionClick,
  className = '',
}) => {
  return (
    <div
      data-testid="clinical-recommendations"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              AI Clinical Recommendations
            </h3>
            <p className="text-xs text-slate-500">Evidence-based follow-up steps generated from report analysis</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
          Clinical Guidance
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-teal-400 dark:hover:border-teal-600 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200">
                  {rec.urgency}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {rec.category}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {rec.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                {rec.description}
              </p>
            </div>

            {onActionClick && (
              <button
                onClick={() => onActionClick(rec)}
                className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-center"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
