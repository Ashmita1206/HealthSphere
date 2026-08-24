import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Activity, Heart, Scale } from "lucide-react";

export interface MetricDataset {
  id: "weight" | "glucose" | "heartRate";
  label: string;
  unit: string;
  refLow: number;
  refHigh: number;
  icon: React.ElementType;
  description: string;
  data: { date: string; value: number }[];
}

const metricDatasets: MetricDataset[] = [
  {
    id: "weight",
    label: "Weight",
    unit: "kg",
    refLow: 70,
    refHigh: 78,
    icon: Scale,
    description: "30-day continuous weight baseline",
    data: [],
  },
  {
    id: "glucose",
    label: "Fasting Glucose",
    unit: "mg/dL",
    refLow: 70,
    refHigh: 99,
    icon: Activity,
    description: "Fasting plasma glucose baseline with OCR lab points",
    data: [],
  },
  {
    id: "heartRate",
    label: "Resting Heart Rate",
    unit: "bpm",
    refLow: 60,
    refHigh: 80,
    icon: Heart,
    description: "Continuous resting heart rate telemetry",
    data: [],
  },
];

interface HealthTrendChartProps {
  title?: string;
  description?: string;
  data?: any[];
  dataKey?: string;
  color?: string;
  unit?: string;
  vitalsData?: {
    weight?: any[];
    glucose?: any[];
    heartRate?: any[];
  };
}

export const HealthTrendChart = memo(function HealthTrendChart({
  title,
  description,
  data: propData,
  unit: propUnit,
  vitalsData,
}: HealthTrendChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<"weight" | "glucose" | "heartRate">("glucose");
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "90d">("30d");

  const effectiveDatasets = useMemo(() => {
    return metricDatasets.map((ds) => {
      let customSeries: any[] | undefined = undefined;

      if (vitalsData) {
        if (ds.id === "weight" && Array.isArray(vitalsData.weight) && vitalsData.weight.length > 0) {
          customSeries = vitalsData.weight;
        } else if (ds.id === "glucose" && Array.isArray(vitalsData.glucose) && vitalsData.glucose.length > 0) {
          customSeries = vitalsData.glucose;
        } else if (ds.id === "heartRate" && Array.isArray(vitalsData.heartRate) && vitalsData.heartRate.length > 0) {
          customSeries = vitalsData.heartRate;
        }
      } else if (ds.id === "weight" && propData && Array.isArray(propData) && propData.length > 0) {
        customSeries = propData;
      }

      if (customSeries) {
        return {
          ...ds,
          unit: propUnit || ds.unit,
          data: customSeries.map((d: any) => ({
            date: d.date || d.day || "2026-08-01",
            value: d.weight ?? d.value ?? 74,
          })),
        };
      }
      return ds;
    });
  }, [propData, propUnit, vitalsData]);

  const currentDataset = useMemo(
    () => effectiveDatasets.find((m) => m.id === selectedMetric) || effectiveDatasets[0],
    [effectiveDatasets, selectedMetric],
  );

  const filteredData = useMemo(() => {
    const limits = { "7d": 4, "30d": 8, "90d": 8 } as const;
    return currentDataset.data.slice(-limits[dateFilter]);
  }, [currentDataset, dateFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0F766E]" />
                <span>{title || "Clinical Telemetry & Health Trend"}</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal mt-0.5">
                {description || currentDataset.description} · Normal Ref: {currentDataset.refLow}–{currentDataset.refHigh} {currentDataset.unit}
              </CardDescription>
            </div>

            {/* Metric Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-xl border border-[#E5E7EB]">
              {metricDatasets.map((m) => {
                const Icon = m.icon;
                const isActive = selectedMetric === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMetric(m.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-white text-[#0F766E] shadow-xs border border-[#E5E7EB]"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 pb-4">
          {/* Subheader Date Range Controls */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[11px] font-bold text-[#0F766E] bg-[#F0FDFA] px-2.5 py-0.5 rounded-full border border-[#CCFBF1]">
              Latest: {currentDataset.data.length > 0 ? `${currentDataset.data[currentDataset.data.length - 1].value} ${currentDataset.unit}` : 'No entries'}
            </span>

            <div className="flex items-center gap-1" aria-label="Date range selector">
              {(["7d", "30d", "90d"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={dateFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter(filter)}
                  className={`text-[10px] font-bold h-6 px-2 rounded-md ${
                    dateFilter === filter
                      ? "bg-[#0F766E] text-white hover:bg-[#115E59]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {filter === "7d" ? "7 Days" : filter === "30d" ? "30 Days" : "90 Days"}
                </Button>
              ))}
            </div>
          </div>

          {/* Recharts Line Chart / Neutral Empty State */}
          <div
            className="h-60 w-full"
            role="img"
            aria-label={`${currentDataset.label} trend chart`}
          >
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

                  {/* Soft Mint Reference Band */}
                  <ReferenceArea
                    y1={currentDataset.refLow}
                    y2={currentDataset.refHigh}
                    fill="#F0FDFA"
                    stroke="#14B8A6"
                    strokeDasharray="2 2"
                    strokeOpacity={0.4}
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickFormatter={(val: string) => {
                      if (!val) return "";
                      const d = new Date(val);
                      return isNaN(d.getTime())
                        ? val
                        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                  />

                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={["dataMin - 5", "dataMax + 5"]}
                    tickFormatter={(val) => `${val}`}
                  />

                  {/* Custom Healthcare Tooltip */}
                  <Tooltip
                    content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const val = payload[0].value as number;
                    const isAbnormal = val < currentDataset.refLow || val > currentDataset.refHigh;
                    const formattedDate = label
                      ? new Date(label).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "";

                    return (
                      <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-md space-y-1 min-w-[160px]">
                        <p className="text-[11px] font-semibold text-[#64748B]">{formattedDate}</p>
                        <p className="text-sm font-extrabold text-[#0F172A] flex items-center justify-between gap-2 font-mono">
                          <span>{currentDataset.label}:</span>
                          <span className={isAbnormal ? "text-[#DC2626]" : "text-[#0F766E]"}>
                            {val} {currentDataset.unit}
                          </span>
                        </p>
                        <div className="pt-1 flex items-center justify-between border-t border-[#F1F5F9]">
                          <span className="text-[10px] text-[#64748B]">Status</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAbnormal
                                ? "bg-red-50 text-[#DC2626] border border-red-200"
                                : "bg-emerald-50 text-[#047857] border border-emerald-200"
                            }`}
                          >
                            {isAbnormal ? "Out of Range" : "Optimal"}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const val = payload.value;
                    const isAbnormal = val < currentDataset.refLow || val > currentDataset.refHigh;
                    return (
                      <circle
                        key={`dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={isAbnormal ? 5 : 3.5}
                        fill={isAbnormal ? "#DC2626" : "#0F766E"}
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                      />
                    );
                  }}
                  activeDot={{ r: 6, fill: "#0F766E", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 font-medium bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                No {currentDataset.label.toLowerCase()} vitals logged yet. Record entries in your health log to build telemetry trends.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
