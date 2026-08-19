import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'landing';
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  to?: string;
  className?: string;
  onClick?: () => void;
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  showBadge = true,
  to = '/dashboard',
  className,
  onClick,
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
  };

  const svgSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-5 w-5',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const isIconOnly = variant === 'icon';

  const content = (
    <div className={cn('flex items-center gap-2.5 group select-none', className)}>
      {/* Brand Icon Mark */}
      <div
        className={cn(
          'rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0',
          iconSizes[size]
        )}
      >
        <Activity className={cn('stroke-[2.5]', svgSizes[size])} />
      </div>

      {/* Brand Label & Badge */}
      {!isIconOnly && (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={cn(
              'font-extrabold tracking-tight text-[#0F172A] font-heading',
              textSizes[size]
            )}
          >
            HealthSphere
          </span>
          {showBadge && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E6F4F1] text-[#047857] border border-[#A7F3D0]">
              AI
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-xl"
        aria-label="HealthSphere AI Healthcare Platform"
      >
        {content}
      </Link>
    );
  }

  return content;
}
