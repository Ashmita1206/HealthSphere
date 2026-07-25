import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'teal' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  description?: string;
  index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = 'teal',
  description,
  index = 0,
}) => {
  const colorStyles = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200/70',
      iconBg: 'bg-teal-600 text-white',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200/70',
      iconBg: 'bg-blue-600 text-white',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/70',
      iconBg: 'bg-emerald-600 text-white',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/70',
      iconBg: 'bg-amber-500 text-white',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200/70',
      iconBg: 'bg-rose-600 text-white',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200/70',
      iconBg: 'bg-purple-600 text-white',
    },
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`p-5 md:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium text-slate-500 tracking-wide uppercase">{label}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 font-heading tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${colorStyles.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      {(change || description) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {description && (
            <span className="text-slate-500 font-normal">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};
