import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

export interface AdherenceDay {
  day: string;
  adherence: number; // percentage e.g. 100, 100, 66, 100
  dosesTaken: number;
  dosesTotal: number;
}

interface AdherenceTrendChartProps {
  data: AdherenceDay[];
  height?: number;
}

export function AdherenceTrendChart({ data, height = 180 }: AdherenceTrendChartProps) {
  return (
    <div className="w-full bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-[#0F172A] tracking-tight">
            7-Day Medication Adherence
          </h4>
          <p className="text-[11px] text-[#64748B]">Doses logged on schedule</p>
        </div>
        <span className="text-xs font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
          94% Weekly Rate
        </span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#64748B" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const item = payload[0].payload as AdherenceDay;
              return (
                <div className="bg-[#0F172A] text-white text-xs px-3 py-2 rounded-lg shadow-md border-0">
                  <p className="font-semibold text-slate-300">{item.day}</p>
                  <p className="font-bold text-[#2DD4BF] mt-0.5">
                    {item.dosesTaken}/{item.dosesTotal} doses taken ({item.adherence}%)
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="adherence" radius={[6, 6, 0, 0]} maxBarSize={28}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.adherence === 100 ? "#0F766E" : entry.adherence >= 70 ? "#059669" : "#B45309"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
