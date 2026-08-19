import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Approved high-resolution logo PNGs cropped to 100% zero-margin tight artwork bounds
import logoPng from '@/assets/brand/healthsphere-logo.png';
import logoWhitePng from '@/assets/brand/healthsphere-logo-white.png';
import iconPng from '@/assets/brand/healthsphere-icon.png';
import iconWhitePng from '@/assets/brand/healthsphere-icon-white.png';

export interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'landing';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isDark?: boolean;
  showBadge?: boolean;
  to?: string;
  className?: string;
  onClick?: () => void;
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  isDark = false,
  showBadge = true,
  to = '/dashboard',
  className,
  onClick,
}: BrandLogoProps) {
  const isIconOnly = variant === 'icon';

  // Section 3: Target visual HealthSphere logo artwork heights (DOMINANT BRAND):
  // Landing/Public Desktop: 54-58px (size="lg")
  // Authenticated Desktop Navbar: 50-52px (size="md")
  // Mobile Navbar: 40-44px (size="sm" or "md" mobile)
  // Expanded Sidebar: 48px (size="md")
  // Collapsed Sidebar: 44x44px icon only (size="md" icon)
  // Login / Register: 56-60px desktop (size="xl"), 44px mobile
  const logoHeights = {
    sm: 'h-[40px] sm:h-[44px]',
    md: 'h-[42px] sm:h-[52px]',
    lg: 'h-[44px] sm:h-[58px]',
    xl: 'h-[46px] sm:h-[60px]',
  };

  const iconHeights = {
    sm: 'h-[38px] w-[38px]',
    md: 'h-[44px] w-[44px]',
    lg: 'h-[48px] w-[48px]',
    xl: 'h-[54px] w-[54px]',
  };

  // Section 4: AI Badge heights (SMALL & SUBTLE SECONDARY METADATA):
  // Desktop: 22-24px height, 38-44px width
  // Mobile: 20-22px height
  // Light/transparent teal treatment with subtle border
  const badgeHeights = {
    sm: 'h-[20px] px-2 text-[9px] font-bold tracking-wider',
    md: 'h-[22px] px-2 text-[9.5px] sm:h-[24px] sm:px-2.5 sm:text-[10px] font-bold tracking-wider',
    lg: 'h-[22px] px-2 text-[9.5px] sm:h-[25px] sm:px-2.5 sm:text-[10px] font-bold tracking-wider',
    xl: 'h-[24px] px-2.5 text-[10px] sm:h-[26px] sm:px-3 sm:text-[10.5px] font-bold tracking-wider',
  };

  const selectedImage = isIconOnly
    ? isDark
      ? iconWhitePng
      : iconPng
    : isDark
      ? logoWhitePng
      : logoPng;

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 group select-none shrink-0', className)}>
      {/* Approved HealthSphere Logo Artwork (Primary Brand - DOMINANT) */}
      <img
        src={selectedImage}
        alt="HealthSphere"
        className={cn(
          'w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01] shrink-0 self-center',
          isIconOnly ? iconHeights[size] : logoHeights[size]
        )}
      />

      {/* Small Secondary AI Badge (Secondary Metadata) */}
      {showBadge && !isIconOnly && (
        <span
          className={cn(
            'inline-flex items-center justify-center uppercase border rounded-full shrink-0 select-none self-center leading-none transition-colors duration-200',
            badgeHeights[size],
            isDark
              ? 'bg-teal-950/70 text-teal-300 border-teal-700/50 shadow-2xs'
              : 'bg-teal-50/80 text-teal-700 border-teal-200/80 shadow-2xs'
          )}
        >
          AI
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-xl shrink-0"
        aria-label="HealthSphere AI Healthcare Platform"
      >
        {content}
      </Link>
    );
  }

  return content;
}
