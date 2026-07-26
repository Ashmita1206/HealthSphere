import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

interface MedicineFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  onClearFilters: () => void;
}

export function MedicineFilters({ filter, onFilterChange, sortBy, onSortChange, onClearFilters }: MedicineFiltersProps) {
  const filters = [
    { value: 'all', label: 'All Medicines' },
    { value: 'active', label: 'Active' },
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'night', label: 'Night' },
    { value: 'completed', label: 'Completed' },
    { value: 'missed', label: 'Missed' },
    { value: 'expired', label: 'Expired' },
    { value: 'archived', label: 'Archived' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'expiry', label: 'Expiry Date' },
    { value: 'remaining', label: 'Remaining Pills' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2 flex-1">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 flex-1" aria-label="Filter medicines">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {filters.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 flex-1">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 flex-1" aria-label="Sort medicines">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {sortOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(filter !== 'all' || sortBy !== 'recent') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900"
          aria-label="Clear filters"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
