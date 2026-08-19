import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export interface ScoreCategory {
  category: string;
  score: number;
  benchmark: number;
  status: "optimal" | "stable" | "attention";
}

interface HealthScoreBreakdownProps {
  categories: ScoreCategory[];
  height?: number;
}

export function HealthScoreBreakdown({
  categories,
  height = 200,
}: HealthScoreBreakdownProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold text-[#0F172A] tracking-tight uppercase">
          Category Health Breakdown
        </h4>
        <span className="text-[11px] font-medium text-[#64748B]">
          Target Benchmark: 80+
        </span>
      </div>
      <div className="w-full bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={categories}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#0F172A", fontWeight: 600 }}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as ScoreCategory;
                return (
                  <div className="bg-[#0F172A] text-white text-xs px-3 py-2 rounded-lg shadow-md border-0 space-y-1">
                    <p className="font-bold text-white">{data.category}</p>
                    <p className="text-slate-300">
                      Score: <span className="font-bold text-teal-300">{data.score}/100</span>
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Clinical Benchmark: {data.benchmark}/100
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
              {categories.map((entry, index) => {
                const fill =
                  entry.score >= 85
                    ? "#059669"
                    : entry.score >= 75
                    ? "#0F766E"
                    : "#D97706";
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
