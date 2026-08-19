import React from 'react';
import { Card } from '../primitives/Card';

export interface HealthScoreCategory {
  key: string;
  title: string;
  score: number;
  explanation: string;
}

export interface HealthScoreBreakdownProps {
  categories: HealthScoreCategory[];
}

export const HealthScoreBreakdown: React.FC<HealthScoreBreakdownProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <Card key={cat.key} variant="base" padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{cat.title}</h4>
            <span className="text-lg font-extrabold text-teal-800 tabular-nums font-mono">{cat.score}/100</span>
          </div>

          {/* Restrained Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-teal-800 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, cat.score))}%` }}
            />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{cat.explanation}</p>
        </Card>
      ))}
    </div>
  );
};
