import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  centered = true,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`space-y-3 ${centered ? 'text-center max-w-3xl mx-auto' : ''} ${className}`}
    >
      {badge && (
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-teal-50 text-teal-700 border border-teal-200/60 shadow-sm ${centered ? 'mx-auto' : ''}`}>
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          {badge}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-heading">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg text-slate-600 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
