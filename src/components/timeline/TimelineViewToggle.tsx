import { memo } from 'react';
import { AlignJustify, Columns3, ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TimelineViewMode } from './timelineTypes';

interface TimelineViewToggleProps {
  value: TimelineViewMode;
  onChange: (value: TimelineViewMode) => void;
}

const options = [
  { value: 'vertical' as const, label: 'Vertical timeline', icon: ListTree },
  { value: 'compact' as const, label: 'Compact view', icon: AlignJustify },
  { value: 'cards' as const, label: 'Card view', icon: Columns3 },
];

export const TimelineViewToggle = memo(function TimelineViewToggle({
  value,
  onChange,
}: TimelineViewToggleProps) {
  return (
    <div
      className="flex rounded-xl border border-slate-200 bg-slate-50 p-1"
      role="group"
      aria-label="Timeline view"
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange(option.value)}
          className={`h-8 w-8 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-600 ${
            value === option.value
              ? 'bg-white text-teal-700 shadow-sm hover:bg-white'
              : 'text-slate-500'
          }`}
          aria-label={option.label}
          aria-pressed={value === option.value}
          title={option.label}
        >
          <option.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
});
