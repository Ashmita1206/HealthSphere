import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

interface HealthTrendDatum {
  date: string;
  [key: string]: string | number;
}

interface HealthTrendChartProps {
  title: string;
  description: string;
  data: HealthTrendDatum[];
  dataKey: string;
  color: string;
  unit: string;
  // TODO: Backend Integration - Add date filter support when backend API is ready
  // Currently using frontend-only date filter state
}

export const HealthTrendChart = memo(function HealthTrendChart({
  title,
  description,
  data,
  dataKey,
  color,
  unit,
}: HealthTrendChartProps) {
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "90d">("7d");

  // TODO: Backend Integration - Filter data based on selected date range
  // Currently showing all data, backend should support ?days=7, ?days=30, ?days=90
  const filteredData = useMemo(() => {
    const limits = { "7d": 7, "30d": 30, "90d": 90 } as const;
    return data.slice(-limits[dateFilter]);
  }, [data, dateFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-700" />
                {title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-normal">
                {description}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-1" aria-label={`${title} date range`}>
              {(["7d", "30d", "90d"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={dateFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter(filter)}
                  aria-pressed={dateFilter === filter}
                  className={`text-[10px] font-bold h-7 px-2 rounded-lg ${
                    dateFilter === filter
                      ? "bg-teal-700 text-white hover:bg-teal-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {filter === "7d" ? "7 Days" : filter === "30d" ? "30 Days" : "90 Days"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div
            className="h-64 w-full"
            role="img"
            aria-label={`${title} trend chart showing ${filteredData.length} data points`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(value: string) => {
                    if (!value) return "";
                    const d = new Date(value);
                    if (isNaN(d.getTime())) {
                      const currentYear = new Date().getFullYear();
                      const dWithYear = new Date(`${value}, ${currentYear}`);
                      if (!isNaN(dWithYear.getTime())) {
                        return dWithYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }
                      return String(value);
                    }
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                  labelFormatter={(value: string) => {
                    if (!value) return "";
                    const d = new Date(value);
                    if (isNaN(d.getTime())) {
                      const currentYear = new Date().getFullYear();
                      const dWithYear = new Date(`${value}, ${currentYear}`);
                      if (!isNaN(dWithYear.getTime())) {
                        return dWithYear.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      }
                      return String(value);
                    }
                    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  }}
                  formatter={(value: number) => [`${value}${unit}`, title]}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ fill: color, r: 4 }}
                  activeDot={{ r: 6, fill: color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
