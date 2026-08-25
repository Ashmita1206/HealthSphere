import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";

export interface WellnessMetric {
  metric: string;
  value: number;
  max: number;
  unit: string;
}

interface WellnessWidgetProps {
  initialMetrics?: WellnessMetric[];
}

export const WellnessWidget = memo(function WellnessWidget({ initialMetrics }: WellnessWidgetProps) {
  const [metrics, setMetrics] = useState<WellnessMetric[]>(initialMetrics || []);
  const [loading, setLoading] = useState(!initialMetrics);

  useEffect(() => {
    if (initialMetrics) return;

    let isMounted = true;
    async function loadVitalsTelemetry() {
      try {
        const res = await api.get<any[]>('/health/logs');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const latest = res.data[0];
          const computedMetrics: WellnessMetric[] = [];

          if (typeof latest.heartRate === 'number' && !isNaN(latest.heartRate)) {
            computedMetrics.push({ metric: 'Heart Rate', value: latest.heartRate, max: 100, unit: 'bpm' });
          }
          if (typeof latest.glucose === 'number' && !isNaN(latest.glucose)) {
            computedMetrics.push({ metric: 'Fasting Glucose', value: latest.glucose, max: 140, unit: 'mg/dL' });
          }
          if (typeof latest.systolic === 'number' && !isNaN(latest.systolic)) {
            computedMetrics.push({ metric: 'Systolic BP', value: latest.systolic, max: 120, unit: 'mmHg' });
          }
          if (typeof latest.weight === 'number' && !isNaN(latest.weight)) {
            computedMetrics.push({ metric: 'Body Weight', value: latest.weight, max: 100, unit: 'kg' });
          }

          if (isMounted) {
            setMetrics(computedMetrics);
          }
        } else if (isMounted) {
          setMetrics([]);
        }
      } catch {
        if (isMounted) {
          setMetrics([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadVitalsTelemetry();
    return () => {
      isMounted = false;
    };
  }, [initialMetrics]);

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-700" />
          Daily Vitals & Telemetry
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 font-normal">Real-time patient telemetry progress</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium animate-pulse">Loading telemetry...</div>
        ) : metrics.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <Activity className="w-6 h-6 text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-700">No Vitals Recorded Today</p>
            <p className="text-[11px] text-slate-500">Log your daily telemetry to view progress metrics.</p>
          </div>
        ) : (
          metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{metric.metric}</span>
                <span className="font-semibold text-slate-500">
                  {metric.value} / {metric.max} {metric.unit}
                </span>
              </div>
              <Progress
                value={Math.min(100, (metric.value / metric.max) * 100)}
                className="h-2 bg-slate-100"
                aria-label={`${metric.metric}: ${metric.value} of ${metric.max} ${metric.unit}`}
              />
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
});
