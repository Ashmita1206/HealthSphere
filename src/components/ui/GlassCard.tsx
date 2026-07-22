import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};
