import React, { useState } from 'react';
import { Apple, Dumbbell, Moon, Pill, CheckCircle2, Circle, Sparkles, ChevronRight } from 'lucide-react';

export interface WellnessPlanItem {
  id: string;
  domain: 'nutrition' | 'exercise' | 'sleep' | 'medication';
  title: string;
  frequency: string;
  clinicalRationale: string;
  completed: boolean;
}

export const DEFAULT_WELLNESS_PLANS: WellnessPlanItem[] = [
  {
    id: 'wp-1',
    domain: 'nutrition',
    title: 'Maintain Mediterranean Glycemic Load < 45g/meal',
    frequency: 'Daily (All Meals)',
    clinicalRationale: 'Directly lowers post-prandial glycemic excursions and prevents HbA1c progression.',
    completed: false,
  },
  {
    id: 'wp-2',
    domain: 'exercise',
    title: 'Zone 2 Aerobic Training (140-150 min weekly)',
    frequency: '4x per week',
    clinicalRationale: 'Enhances peripheral insulin sensitivity and increases mitochondrial density.',
    completed: true,
  },
  {
    id: 'wp-3',
    domain: 'sleep',
    title: 'Target 7.5 Hours of Restorative Sleep with 22:30 Bedtime',
    frequency: 'Nightly',
    clinicalRationale: 'Curbs morning cortisol surges which elevate fasting blood glucose.',
    completed: false,
  },
  {
    id: 'wp-4',
    domain: 'medication',
    title: 'Adhere to Morning Metformin 500mg with breakfast',
    frequency: 'Daily with meal',
    clinicalRationale: 'Optimizes hepatic glucose output suppression throughout waking hours.',
    completed: true,
  },
];

export const WellnessPlanCards: React.FC<{
  plans?: WellnessPlanItem[];
  onTogglePlan?: (id: string) => void;
  className?: string;
}> = ({ plans = DEFAULT_WELLNESS_PLANS, onTogglePlan, className = '' }) => {
  const [localPlans, setLocalPlans] = useState(plans);

  const handleToggle = (id: string) => {
    setLocalPlans((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
    onTogglePlan?.(id);
  };

  const getDomainIcon = (domain: WellnessPlanItem['domain']) => {
    switch (domain) {
      case 'nutrition':
        return <Apple className="w-4 h-4 text-emerald-600" />;
      case 'exercise':
        return <Dumbbell className="w-4 h-4 text-cyan-600" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-indigo-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-amber-600" />;
    }
  };

  const completedCount = localPlans.filter((p) => p.completed).length;
  const progressPct = Math.round((completedCount / localPlans.length) * 100);

  return (
    <div
      data-testid="wellness-plan-cards"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              AI Personalized Wellness Prescription
            </h3>
            <p className="text-xs text-slate-500">
              Evidence-based lifestyle interventions targeted to your clinical risk drivers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {completedCount} of {localPlans.length} Active
          </span>
          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {localPlans.map((plan) => (
          <div
            key={plan.id}
            data-testid={`plan-item-${plan.id}`}
            onClick={() => handleToggle(plan.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
              plan.completed
                ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/60'
                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-teal-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400"
              >
                {plan.completed ? (
                  <CheckCircle2 className="w-5 h-5 fill-teal-600 text-white dark:text-slate-900" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {getDomainIcon(plan.domain)}
                  </span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {plan.domain} • {plan.frequency}
                  </span>
                </div>
                <h4
                  className={`text-xs font-bold leading-snug ${
                    plan.completed
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {plan.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {plan.clinicalRationale}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
