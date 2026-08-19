import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
} from "recharts";

export interface HealthTrendPoint {
  date: string;
  value: number;
  sys?: number;
  dia?: number;
  unit?: string;
  isOutlier?: boolean;
}

interface HealthTrendChartProps {
  data: HealthTrendPoint[];
  title?: string;
  unit?: string;
  refLow?: number;
  refHigh?: number;
  color?: string;
  height?: number;
}

export function HealthTrendChart({
  data,
  title,
  unit = "mg/dL",
  refLow = 70,
  refHigh = 100,
  color = "#0F766E",
  height = 240,
}: HealthTrendChartProps) {
  return (
    <div className="w-full space-y-2">
      {title && (
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-[#0F172A] tracking-tight">
            {title}
          </h4>
          <span className="text-[11px] font-medium text-[#64748B]">
            Normal Range: {refLow}–{refHigh} {unit}
          </span>
        </div>
      )}
      <div className="w-full bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-xs">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 10", "dataMax + 10"]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const val = payload[0].value as number;
                const isOut = val < refLow || val > refHigh;
                return (
                  <div className="bg-[#0F172A] text-white text-xs px-3 py-2 rounded-lg shadow-md border-0 space-y-0.5">
                    <p className="font-semibold text-slate-300">{label}</p>
                    <p className="font-bold flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isOut ? "#DC2626" : color }}
                      />
                      {val} {unit}
                      {isOut && (
                        <span className="text-[10px] bg-red-900/80 text-red-200 px-1.5 py-0.2 rounded font-bold ml-1">
                          Out of range
                        </span>
                      )}
                    </p>
                  </div>
                );
              }}
            />
            {/* Soft Mint Normal Reference Band */}
            {refLow != null && refHigh != null && (
              <ReferenceArea
                y1={refLow}
                y2={refHigh}
                fill="#F0FDFA"
                stroke="#14B8A6"
                strokeDasharray="2 2"
                strokeOpacity={0.5}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const val = payload.value;
                const isOut = val < refLow || val > refHigh;
                if (isOut) {
                  return (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={4.5}
                      fill="#DC2626"
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                    />
                  );
                }
                return (
                  <circle
                    key={`dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                );
              }}
              activeDot={{ r: 6, fill: color, stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
