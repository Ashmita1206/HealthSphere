import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Flame,
  Wind,
  Pill,
  Moon,
  Footprints,
  Apple,
  Zap,
  FlaskConical,
  ClipboardCheck,
} from 'lucide-react';

export interface SubScoreItem {
  id: string;
  name: string;
  score: number;
  status: 'Optimal' | 'Stable' | 'Attention' | 'At Risk';
  metricValue: string;
  metricLabel: string;
  icon: React.ElementType;
  accentColor: string;
  bgLight: string;
  borderLight: string;
}

export interface HealthSubScoreGridProps {
  customScores?: Partial<Record<string, number>>;
  className?: string;
}

export const DEFAULT_10_SUB_SCORES: SubScoreItem[] = [
  {
    id: 'cardiovascular',
    name: 'Cardiovascular Health',
    score: 88,
    status: 'Optimal',
    metricValue: '118/78 mmHg',
    metricLabel: 'Resting BP & Pulse',
    icon: Heart,
    accentColor: '#EF4444',
    bgLight: 'bg-rose-50 dark:bg-rose-950/30',
    borderLight: 'border-rose-200 dark:border-rose-900/40',
  },
  {
    id: 'metabolic',
    name: 'Metabolic Stability',
    score: 82,
    status: 'Stable',
    metricValue: '98 mg/dL',
    metricLabel: 'Fasting Blood Glucose',
    icon: Flame,
    accentColor: '#F97316',
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    borderLight: 'border-orange-200 dark:border-orange-900/40',
  },
  {
    id: 'respiratory',
    name: 'Respiratory Efficiency',
    score: 95,
    status: 'Optimal',
    metricValue: '98% SpO2',
    metricLabel: 'Blood Oxygen Saturation',
    icon: Wind,
    accentColor: '#06B6D4',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderLight: 'border-cyan-200 dark:border-cyan-900/40',
  },
  {
    id: 'adherence',
    name: 'Medication Adherence',
    score: 90,
    status: 'Optimal',
    metricValue: '90% Schedule',
    metricLabel: 'Dose Tracking Rate',
    icon: Pill,
    accentColor: '#10B981',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderLight: 'border-emerald-200 dark:border-emerald-900/40',
  },
  {
    id: 'sleep',
    name: 'Sleep & Recovery',
    score: 76,
    status: 'Stable',
    metricValue: '7h 24m',
    metricLabel: 'Nightly Sleep Duration',
    icon: Moon,
    accentColor: '#6366F1',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderLight: 'border-indigo-200 dark:border-indigo-900/40',
  },
  {
    id: 'activity',
    name: 'Physical Activity',
    score: 84,
    status: 'Optimal',
    metricValue: '8,420 steps',
    metricLabel: 'Daily Movement Average',
    icon: Footprints,
    accentColor: '#14B8A6',
    bgLight: 'bg-teal-50 dark:bg-teal-950/30',
    borderLight: 'border-teal-200 dark:border-teal-900/40',
  },
  {
    id: 'nutrition',
    name: 'Nutritional Balance',
    score: 78,
    status: 'Stable',
    metricValue: '2.4 L/day',
    metricLabel: 'Hydration & Diet Index',
    icon: Apple,
    accentColor: '#84CC16',
    bgLight: 'bg-lime-50 dark:bg-lime-950/30',
    borderLight: 'border-lime-200 dark:border-lime-900/40',
  },
  {
    id: 'stress',
    name: 'Autonomic & Stress',
    score: 72,
    status: 'Attention',
    metricValue: '58 ms HRV',
    metricLabel: 'Heart Rate Variability',
    icon: Zap,
    accentColor: '#EAB308',
    bgLight: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderLight: 'border-yellow-200 dark:border-yellow-900/40',
  },
  {
    id: 'biomarkers',
    name: 'Biomarkers & Labs',
    score: 85,
    status: 'Optimal',
    metricValue: 'Normal Range',
    metricLabel: 'Recent OCR Lab Findings',
    icon: FlaskConical,
    accentColor: '#8B5CF6',
    bgLight: 'bg-purple-50 dark:bg-purple-950/30',
    borderLight: 'border-purple-200 dark:border-purple-900/40',
  },
  {
    id: 'prevention',
    name: 'Preventive Screening',
    score: 92,
    status: 'Optimal',
    metricValue: 'Up to Date',
    metricLabel: 'Checkup & Vaccine Registry',
    icon: ClipboardCheck,
    accentColor: '#0284C7',
    bgLight: 'bg-sky-50 dark:bg-sky-950/30',
    borderLight: 'border-sky-200 dark:border-sky-900/40',
  },
];

export const HealthSubScoreGrid: React.FC<HealthSubScoreGridProps> = ({
  customScores = {},
  className = '',
}) => {
  const scores = DEFAULT_10_SUB_SCORES.map((item) => {
    if (typeof customScores[item.id] === 'number') {
      const newScore = customScores[item.id]!;
      const status: SubScoreItem['status'] =
        newScore >= 85 ? 'Optimal' : newScore >= 70 ? 'Stable' : newScore >= 50 ? 'Attention' : 'At Risk';
      return { ...item, score: newScore, status };
    }
    return item;
  });

  return (
    <div data-testid="health-sub-score-grid" className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            10 Clinical Dimension Sub-Scores
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time biometric evaluation across complete physiological pillars
          </p>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
          AI Evaluated
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {scores.map((item, index) => {
          const Icon = item.icon;
          const statusBadgeColor =
            item.status === 'Optimal'
              ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              : item.status === 'Stable'
              ? 'bg-teal-100/70 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300'
              : item.status === 'Attention'
              ? 'bg-amber-100/70 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
              : 'bg-rose-100/70 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs hover:shadow-sm group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.bgLight} border ${item.borderLight}`}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: item.accentColor }} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeColor}`}>
                    {item.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {item.name}
                </h4>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {item.metricValue}
                </p>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span>Score</span>
                  <span>{item.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.accentColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
