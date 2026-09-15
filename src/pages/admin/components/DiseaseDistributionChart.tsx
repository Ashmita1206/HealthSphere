import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

export interface DiseaseStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export const DEFAULT_DISEASE_DATA: DiseaseStat[] = [
  { name: 'Type 2 Diabetes', count: 5038, percentage: 34, color: '#0d9488' }, // Teal
  { name: 'Essential Hypertension', count: 4149, percentage: 28, color: '#6366f1' }, // Indigo
  { name: 'Coronary Artery Disease', count: 2667, percentage: 18, color: '#f43f5e' }, // Rose
  { name: 'Asthma & COPD', count: 1778, percentage: 12, color: '#06b6d4' }, // Cyan
  { name: 'Chronic Kidney Disease', count: 1188, percentage: 8, color: '#f59e0b' }, // Amber
];

export const DiseaseDistributionChart: React.FC<{ data?: DiseaseStat[]; className?: string }> = ({
  data = DEFAULT_DISEASE_DATA,
  className = '',
}) => {
  return (
    <div
      data-testid="disease-distribution-chart"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Chronic Disease Prevalence Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Stratification of 14,820 active patients across clinical diagnostic registries
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="count"
              nameKey="name"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} patients`, name]}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white ml-2 font-mono">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
