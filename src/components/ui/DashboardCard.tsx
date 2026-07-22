import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerBorder?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerBorder = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col ${className}`}
    >
      {(title || action) && (
        <div className={`px-6 py-4 flex items-center justify-between gap-4 ${headerBorder ? 'border-b border-slate-100' : ''}`}>
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-lg font-bold text-slate-900 font-heading tracking-tight">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 font-normal mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6 flex-1">{children}</div>
    </motion.div>
  );
};
