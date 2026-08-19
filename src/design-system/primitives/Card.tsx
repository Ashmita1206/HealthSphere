import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'ai' | 'subtle' | 'interactive' | 'critical';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'base', padding = 'md', children, ...props }, ref) => {
    const variants = {
      base: 'bg-white border border-border subtle-shadow',
      ai: 'bg-[#E6F4F1] border border-[#A7F3D0] text-slate-900',
      subtle: 'bg-[#F3F4F1] border border-border-subtle text-slate-900',
      interactive:
        'bg-white border border-border hover:border-teal-700/50 hover:shadow-md cursor-pointer transition-all duration-200 active:scale-[0.995]',
      critical: 'bg-red-50/80 border border-red-200 text-red-950',
    };

    const paddings = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-2xl transition-all', variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
