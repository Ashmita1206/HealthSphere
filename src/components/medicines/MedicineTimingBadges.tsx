import { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { getTimingLabels } from './medicineUtils';

interface MedicineTimingBadgesProps {
  timing?: string;
  className?: string;
}

const timingClasses: Record<string, string> = {
  morning: 'bg-amber-50 text-amber-700 border-amber-200',
  afternoon: 'bg-sky-50 text-sky-700 border-sky-200',
  night: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const MedicineTimingBadges = memo(function MedicineTimingBadges({
  timing,
  className = '',
}: MedicineTimingBadgesProps) {
  const timingLabels = useMemo(() => getTimingLabels(timing), [timing]);
  if (timingLabels.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      aria-label={`Medicine timing: ${timingLabels.join(', ')}`}
    >
      {timingLabels.map((label) => (
        <Badge
          key={label}
          className={`px-2 py-0.5 text-[10px] font-bold ${
            timingClasses[label.toLowerCase()] ??
            'bg-teal-50 text-teal-700 border-teal-200'
          }`}
        >
          {label}
        </Badge>
      ))}
    </div>
  );
});
