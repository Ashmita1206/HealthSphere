import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AppointmentFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  onClearFilters: () => void;
}

const filterOptions = [
  { value: 'all', label: 'All Appointments' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'missed', label: 'Missed' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
];

const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'doctor', label: 'Doctor Name' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'status', label: 'Status' },
];

export const AppointmentFilters = memo(function AppointmentFilters({
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  onClearFilters,
}: AppointmentFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 w-[180px]">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 w-[140px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filter !== 'all' || sortBy !== 'date') && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-10 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900"
        >
          Clear
        </Button>
      )}
    </div>
  );
});
