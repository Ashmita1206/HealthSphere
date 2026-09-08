import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sparkles,
  Pill,
  Calendar,
  FileText,
  Activity,
  Heart,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { HealthInsight } from '@/services/analyticsService';

interface InsightsCardProps {
  insights?: HealthInsight[];
  onDismiss?: (id: string) => void;
}

export const InsightsCard: React.FC<InsightsCardProps> = ({
  insights: initialInsights,
  onDismiss,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const defaultInsights: HealthInsight[] = [
    {
      id: 'ins-1',
      type: 'positive',
      priority: 'high',
      category: 'medicine',
      title: 'Medication Adherence on Track',
      message: 'You completed all scheduled medicines this week without missed doses.',
    },
    {
      id: 'ins-2',
      type: 'positive',
      priority: 'medium',
      category: 'health_score',
      title: 'Score Trend',
      message: 'Your overall Health Score improved by 9 points compared to baseline.',
    },
    {
      id: 'ins-3',
      type: 'info',
      priority: 'low',
      category: 'appointment',
      title: 'Preventive Care',
      message: 'You have no appointment scheduled. Consider booking your routine annual checkup.',
    },
  ];

  const rawList = initialInsights && initialInsights.length > 0 ? initialInsights : defaultInsights;
  const visibleInsights = rawList.filter((item) => !dismissedIds.includes(item.id));

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, id]);
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medicine':
        return <Pill className="w-3.5 h-3.5 text-emerald-600" />;
      case 'appointment':
        return <Calendar className="w-3.5 h-3.5 text-blue-600" />;
      case 'report':
        return <FileText className="w-3.5 h-3.5 text-violet-600" />;
      case 'vitals':
      case 'health_score':
        return <Heart className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  const getTypeStyle = (type: string, priority: string) => {
    if (priority === 'high' || type === 'warning') {
      return {
        border: 'border-amber-200',
        bg: 'bg-amber-50/60',
        badge: 'bg-amber-100 text-amber-800',
      };
    }
    if (type === 'positive') {
      return {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50/50',
        badge: 'bg-emerald-100 text-emerald-800',
      };
    }
    return {
      border: 'border-slate-200',
      bg: 'bg-slate-50/60',
      badge: 'bg-slate-100 text-slate-700',
    };
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden flex flex-col justify-between">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
                Smart Health Insights
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Actionable recommendations based on your activity
              </CardDescription>
            </div>
          </div>
          {visibleInsights.length > 0 && (
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
              {visibleInsights.length} Active
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {visibleInsights.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1.5">
            <CheckCircle2 className="w-6 h-6 text-teal-600" />
            <span className="font-semibold text-slate-700">All insights acknowledged</span>
            <span className="text-[11px] text-slate-400">New care updates will appear here automatically.</span>
          </div>
        ) : (
          visibleInsights.map((insight) => {
            const style = getTypeStyle(insight.type, insight.priority);
            return (
              <div
                key={insight.id}
                className={`relative rounded-xl border p-3 transition-all ${style.border} ${style.bg} flex items-start justify-between gap-3 group`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(insight.category)}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {insight.title}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${style.badge}`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDismiss(insight.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-opacity shrink-0"
                  title="Dismiss insight"
                  aria-label="Dismiss insight"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
