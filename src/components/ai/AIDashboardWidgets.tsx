import React, { useState, useEffect } from 'react';
import { aiService, DashboardLogicData } from '@/services/ai/aiService';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Lightbulb } from 'lucide-react';

export const AIDashboardWidgets: React.FC = () => {
  const [data, setData] = useState<DashboardLogicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiService
      .getDashboardLogic()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Risk Alerts Banner */}
      {data.riskAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs text-rose-900 dark:text-rose-200">
              {data.riskAlerts[0].title}
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300">{data.riskAlerts[0].detail}</p>
          </div>
        </div>
      )}

      {/* Today's & Weekly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-xs">
            <Activity className="w-4 h-4" /> Today&apos;s AI Clinical Brief
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.todaysSummary}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs">
            <TrendingUp className="w-4 h-4" /> Weekly Wellness Trend
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.weeklySummary}
          </p>
        </div>
      </div>

      {/* AI Insights & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-5 rounded-3xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 space-y-3">
          <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-extrabold text-xs">
            <Lightbulb className="w-4 h-4 text-teal-600" /> Key AI Insights
          </div>
          <ul className="space-y-2">
            {data.aiInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Daily Goals */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            Daily Goals
          </h4>
          <div className="space-y-2">
            {data.dailyGoals.map((goal, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      goal.completed ? 'text-teal-600 dark:text-teal-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                  <span className={goal.completed ? 'line-through text-slate-400' : 'font-medium text-slate-700 dark:text-slate-300'}>
                    {goal.title}
                  </span>
                </div>
                {goal.current && <span className="text-[10px] text-slate-400 font-mono">{goal.current}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
