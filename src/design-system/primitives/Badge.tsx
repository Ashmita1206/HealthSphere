import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'healthy' | 'attention' | 'critical' | 'info' | 'ai';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'info',
  icon,
  children,
  ...props
}) => {
  const styles = {
    healthy: {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      defaultIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
    },
    attention: {
      container: 'bg-amber-50 text-amber-900 border-amber-200',
      defaultIcon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
    },
    critical: {
      container: 'bg-red-50 text-red-900 border-red-200 font-bold',
      defaultIcon: <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />,
    },
    info: {
      container: 'bg-teal-50 text-teal-900 border-teal-200',
      defaultIcon: <Info className="w-3.5 h-3.5 text-teal-700 shrink-0" />,
    },
    ai: {
      container: 'bg-[#E6F4F1] text-[#047857] border-[#A7F3D0]',
      defaultIcon: <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />,
    },
  };

  const selected = styles[variant];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold tracking-tight transition-colors',
        selected.container,
        className
      )}
      {...props}
    >
      {icon ?? selected.defaultIcon}
      <span>{children}</span>
    </div>
  );
};
