import { memo } from 'react';
import { CalendarRange, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TIMELINE_DATE_OPTIONS,
  TIMELINE_FILTER_OPTIONS,
  TIMELINE_SORT_OPTIONS,
} from './timelineConstants';
import type {
  TimelineCustomRange,
  TimelineDateFilter,
  TimelineFilterCategory,
  TimelineSort,
} from './timelineTypes';

interface TimelineFiltersProps {
  dateFilter: TimelineDateFilter;
  onDateFilterChange: (value: TimelineDateFilter) => void;
  customRange: TimelineCustomRange;
  onCustomRangeChange: (value: TimelineCustomRange) => void;
  typeFilters: TimelineFilterCategory[];
  onTypeFilterToggle: (value: TimelineFilterCategory) => void;
  onClearTypeFilters: () => void;
  sort: TimelineSort;
  onSortChange: (value: TimelineSort) => void;
}

export const TimelineFilters = memo(function TimelineFilters({
  dateFilter,
  onDateFilterChange,
  customRange,
  onCustomRangeChange,
  typeFilters,
  onTypeFilterToggle,
  onClearTypeFilters,
  sort,
  onSortChange,
}: TimelineFiltersProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <CalendarRange className="h-3.5 w-3.5 text-teal-700" />
              Date range
            </Label>
            <Select
              value={dateFilter}
              onValueChange={(value) =>
                onDateFilterChange(value as TimelineDateFilter)
              }
            >
              <SelectTrigger
                className="h-10 rounded-xl border-slate-200 text-xs focus:ring-teal-600"
                aria-label="Filter timeline by date"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {TIMELINE_DATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <SlidersHorizontal className="h-3.5 w-3.5 text-teal-700" />
              Sort order
            </Label>
            <Select
              value={sort}
              onValueChange={(value) => onSortChange(value as TimelineSort)}
            >
              <SelectTrigger
                className="h-10 rounded-xl border-slate-200 text-xs focus:ring-teal-600"
                aria-label="Sort timeline"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {TIMELINE_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="grid gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="timeline-date-start"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600"
              >
                Start date
              </Label>
              <Input
                id="timeline-date-start"
                type="date"
                value={customRange.start}
                max={customRange.end || undefined}
                onChange={(event) =>
                  onCustomRangeChange({
                    ...customRange,
                    start: event.target.value,
                  })
                }
                className="h-9 rounded-lg border-slate-200 bg-white text-xs focus-visible:ring-teal-600"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="timeline-date-end"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600"
              >
                End date
              </Label>
              <Input
                id="timeline-date-end"
                type="date"
                value={customRange.end}
                min={customRange.start || undefined}
                onChange={(event) =>
                  onCustomRangeChange({
                    ...customRange,
                    end: event.target.value,
                  })
                }
                className="h-9 rounded-lg border-slate-200 bg-white text-xs focus-visible:ring-teal-600"
              />
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <Filter className="h-3.5 w-3.5 text-teal-700" />
              Event categories
            </Label>
            {typeFilters.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearTypeFilters}
                className="h-7 rounded-lg px-2 text-[10px] font-bold text-slate-500"
                aria-label="Clear event category filters"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by event category"
          >
            {TIMELINE_FILTER_OPTIONS.map((option) => {
              const active = typeFilters.includes(option.value);
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onTypeFilterToggle(option.value)}
                  className={`h-8 rounded-full px-3 text-[10px] font-bold focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    active
                      ? 'border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                  aria-pressed={active}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
