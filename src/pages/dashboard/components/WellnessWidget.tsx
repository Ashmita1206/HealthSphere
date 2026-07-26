import { memo } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WellnessMetric {
  metric: string;
  value: number;
  max: number;
  unit: string;
}

// TODO: Backend Integration - Fetch wellness data from /api/health/wellness endpoint.
const defaultWellnessData: WellnessMetric[] = [
  { metric: "Sleep Hours", value: 7.5, max: 8, unit: "hrs" },
  { metric: "Physical Activity", value: 45, max: 60, unit: "mins" },
  { metric: "Hydration Target", value: 2.5, max: 3, unit: "L" },
  { metric: "Daily Steps", value: 8500, max: 10000, unit: "steps" },
];

export const WellnessWidget = memo(function WellnessWidget() {
  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-700" />
          Daily Vitals & Wellness
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 font-normal">Real-time daily goal progress</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {defaultWellnessData.map((metric, idx) => (
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
              value={(metric.value / metric.max) * 100}
              className="h-2 bg-slate-100"
              aria-label={`${metric.metric}: ${metric.value} of ${metric.max} ${metric.unit}`}
            />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
});
