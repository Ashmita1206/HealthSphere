import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, ShieldCheck, Activity } from 'lucide-react';

export interface AIHealthScoreCircleProps {
  score?: number;
  confidence?: number;
  trendDelta?: number;
  statusLabel?: string;
  onExploreBreakdown?: () => void;
  className?: string;
}

export const AIHealthScoreCircle: React.FC<AIHealthScoreCircleProps> = ({
  score = 84,
  confidence = 92,
  trendDelta = 3.2,
  statusLabel,
  onExploreBreakdown,
  className = '',
}) => {
  const radius = 64;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  // Determine health tier styling
  const isOptimal = score >= 85;
  const isGood = score >= 70 && score < 85;
  const isFair = score >= 50 && score < 70;
  const isCritical = score < 50;

  const gradientId = 'healthScoreGradient';
  const startColor = isOptimal ? '#10B981' : isGood ? '#0D9488' : isFair ? '#F59E0B' : '#EF4444';
  const endColor = isOptimal ? '#059669' : isGood ? '#0284C7' : isFair ? '#D97706' : '#DC2626';

  const defaultStatus = isOptimal
    ? 'Optimal Standing'
    : isGood
    ? 'Good Condition'
    : isFair
    ? 'Attention Required'
    : 'Critical Risk';

  const finalStatus = statusLabel || defaultStatus;

  return (
    <div
      data-testid="ai-health-score-circle"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm ${className}`}
    >
      {/* Background ambient blur orb */}
      <div
        className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{ backgroundColor: startColor }}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Side: Score & Visual Meter */}
        <div className="flex items-center gap-6">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={startColor} />
                  <stop offset="100%" stopColor={endColor} />
                </linearGradient>
              </defs>
              {/* Background Track */}
              <circle
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Animated Value Arc */}
              <motion.circle
                stroke={`url(#${gradientId})`}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>

            {/* Central Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.span
                className="text-3xl font-black tracking-tight text-slate-900 dark:text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {Math.round(score)}
              </motion.span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Out of 100
              </span>
            </div>
          </div>

          {/* Details & Tier Badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                {finalStatus}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                <Activity className="w-3 h-3 text-slate-500" />
                AI Digital Twin
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Holistic Health Intelligence
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Synthesized from longitudinal vitals, medication adherence, diagnostic OCR lab findings, and wearable telemetry streams.
            </p>

            {/* Trending Delta */}
            <div className="flex items-center gap-3 pt-1 text-xs font-semibold">
              <span
                className={`inline-flex items-center gap-1 ${
                  trendDelta >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                {trendDelta >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trendDelta >= 0 ? `+${trendDelta}%` : `${trendDelta}%`} vs last week
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {confidence}% AI Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Action Trigger */}
        {onExploreBreakdown && (
          <div className="shrink-0">
            <button
              onClick={onExploreBreakdown}
              className="px-4 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100/80 rounded-xl border border-teal-200/80 dark:border-teal-800/60 transition-all shadow-xs"
            >
              Explore 10 Sub-Scores →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
