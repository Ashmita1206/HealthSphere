import React from 'react';
import { useAIHealthScore } from '@/hooks/ai/useAIHealthScore';
import {
  Activity,
  Heart,
  TrendingUp,
  ShieldCheck,
  Zap,
  Moon,
  Utensils,
  Droplets,
  Pill,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIHealthScore() {
  const { loading, healthScores, predictions, refetch } = useAIHealthScore();

  const scoreIcons: Record<string, React.ReactNode> = {
    riskScore: <AlertCircle className="w-5 h-5 text-rose-500" />,
    lifestyleScore: <Zap className="w-5 h-5 text-amber-500" />,
    recoveryScore: <Activity className="w-5 h-5 text-emerald-500" />,
    sleepScore: <Moon className="w-5 h-5 text-purple-500" />,
    nutritionScore: <Utensils className="w-5 h-5 text-orange-500" />,
    hydrationScore: <Droplets className="w-5 h-5 text-sky-500" />,
    medicationScore: <Pill className="w-5 h-5 text-teal-500" />,
  };

  const scoreTitles: Record<string, string> = {
    riskScore: 'Clinical Risk Score',
    lifestyleScore: 'Lifestyle Score',
    recoveryScore: 'Recovery Score',
    sleepScore: 'Sleep Index Score',
    nutritionScore: 'Nutrition Score',
    hydrationScore: 'Hydration Score',
    medicationScore: 'Medication Adherence',
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-700 text-white">
              <Heart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              AI Health Intelligence & Predictive Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Health Scoring (8 Categories) & Predictive Risk Engine (6 Health Conditions)
          </p>
        </div>

        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1.5"
        >
          <RefreshCw className="w-4 h-4 text-teal-600" /> Recalculate Scores
        </Button>
      </div>

      {loading && (
        <div className="text-center py-16 text-xs text-slate-400 animate-pulse">
          Computing AI health intelligence scores & predictive risk models...
        </div>
      )}

      {!loading && (
        <>
          {/* Overall Health Score Hero */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-800/50">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                Overall AI Health Index
              </span>
              <h2 className="text-3xl font-extrabold font-heading">
                Patient Health Status: <span className="text-teal-400">Optimal</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Calculated by synthesizing active medications, vital logs, recent OCR lab report extractions, and daily wellness behaviors.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md min-w-40">
              <span className="text-5xl font-extrabold text-teal-400 font-mono">
                {healthScores?.overallHealthScore || 82}
              </span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-1">
                out of 100
              </span>
            </div>
          </div>

          {/* Module 5: 7 Sub-Scores Grid */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Categorized AI Health Scores (7 Metrics)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthScores?.scores &&
                Object.entries(healthScores.scores).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                          {scoreIcons[key] || <Activity className="w-5 h-5 text-teal-600" />}
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {scoreTitles[key] || key}
                        </h4>
                      </div>
                      <span className="text-lg font-extrabold text-teal-600 font-mono">{val.score}/100</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">Why:</span> {typeof val.why === 'object' ? JSON.stringify(val.why) : String(val.why || '')}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">Trend:</span>{' '}
                        <span className="text-emerald-600 font-semibold">{typeof val.trend === 'object' ? JSON.stringify(val.trend) : String(val.trend || '')}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-teal-800 dark:text-teal-300 font-medium">
                      <TrendingUp className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{typeof val.recommendation === 'object' ? JSON.stringify(val.recommendation) : String(val.recommendation || '')}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Module 7: Predictive Analytics */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Predictive Health Analytics (6 Risk Predictions)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions &&
                Object.entries(predictions).map(([conditionKey, pred]) => (
                  <div
                    key={conditionKey}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wide">
                        {conditionKey.replace('Risk', '').replace('NonAdherence', '')} Risk
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                          pred.level === 'High'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : pred.level === 'Moderate'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {typeof pred.level === 'object' ? JSON.stringify(pred.level) : String(pred.level || '')} ({typeof pred.probability === 'object' ? JSON.stringify(pred.probability) : String(pred.probability || 0)}%)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preventive Action</p>
                      <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <span>{typeof pred.preventiveAction === 'object' ? JSON.stringify(pred.preventiveAction) : String(pred.preventiveAction || '')}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </>
      )}
    </div>
  );
}
