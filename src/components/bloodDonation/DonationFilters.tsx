import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DonationFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  onClearFilters: () => void;
}

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'critical', label: 'Critical Requests' },
  { value: 'active', label: 'Active Requests' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'nearby', label: 'Nearby' },
];

const sortOptions = [
  { value: 'distance', label: 'Distance' },
  { value: 'blood-group', label: 'Blood Group' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'urgency', label: 'Urgency' },
];

export const DonationFilters = memo(function DonationFilters({
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  onClearFilters,
}: DonationFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200 w-[160px]">
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

      {(filter !== 'all' || sortBy !== 'distance') && (
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
