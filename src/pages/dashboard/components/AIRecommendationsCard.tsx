import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface RecommendationItem {
  id: string;
  category: 'Cardiovascular' | 'Medication' | 'Nutrition' | 'Activity' | 'Preventive';
  title: string;
  description: string;
  impact: 'High Impact' | 'Moderate Impact' | 'Protective';
  actionLabel?: string;
  actionRoute?: string;
}

export interface AIRecommendationsCardProps {
  recommendations?: RecommendationItem[];
  className?: string;
}

export const DEFAULT_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec-1',
    category: 'Cardiovascular',
    title: 'Post-Meal 10-Minute Walk',
    description: 'Light ambulation after dinner can blunt postprandial glucose surges by up to 18% and stabilize blood pressure.',
    impact: 'High Impact',
    actionLabel: 'Log Activity',
    actionRoute: '/profile',
  },
  {
    id: 'rec-2',
    category: 'Medication',
    title: 'Maintain Consistent Morning Timing',
    description: 'Your adherence is 88%. Taking your morning dose with breakfast optimizes therapeutic blood concentrations.',
    impact: 'High Impact',
    actionLabel: 'View Schedule',
    actionRoute: '/medicines',
  },
  {
    id: 'rec-3',
    category: 'Nutrition',
    title: 'Target 2.5L Daily Hydration',
    description: 'Adequate hydration supports renal clearance and prevents false vital tachycardia readings.',
    impact: 'Protective',
    actionLabel: 'Check Vitals',
    actionRoute: '/profile',
  },
];

export const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({
  recommendations = DEFAULT_RECOMMENDATIONS,
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <div
      data-testid="ai-recommendations-card"
      className={`p-5 rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              AI Clinical Recommendations
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Personalized preventative care directives tailored to your health profile
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          Tailored For You
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const isHighImpact = rec.impact === 'High Impact';
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHighImpact
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-900'
                    }`}
                  >
                    {rec.impact}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {rec.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  {rec.description}
                </p>
              </div>

              {rec.actionLabel && (
                <button
                  onClick={() => rec.actionRoute && navigate(rec.actionRoute)}
                  className="shrink-0 self-start sm:self-center px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{rec.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
