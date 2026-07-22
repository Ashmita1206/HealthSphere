import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  linkText?: string;
  linkTo?: string;
  badge?: string;
  index?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  linkText = 'Explore Feature',
  linkTo,
  badge,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className="group relative p-6 md:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300 group-hover:scale-105 shadow-sm">
            <Icon className="w-6 h-6 stroke-[2.2]" />
          </div>
          {badge && (
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-800 transition-colors font-heading mb-2.5">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
          {description}
        </p>
      </div>

      {linkTo ? (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 group-hover:text-teal-900 transition-colors pt-4 border-t border-slate-100"
        >
          <span>{linkText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 pt-4 border-t border-slate-100">
          <span>{linkText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </motion.div>
  );
};
