import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DonationFiltersProps {
  viewMode: 'donors' | 'requests' | 'inventory' | 'history';
  bloodGroup: string;
  onBloodGroupChange: (bg: string) => void;
  availability: string;
  onAvailabilityChange: (av: string) => void;
  requestStatus: string;
  onRequestStatusChange: (status: string) => void;
  urgency: string;
  onUrgencyChange: (urgency: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

const bloodGroups = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonationFilters = memo(function DonationFilters({
  viewMode,
  bloodGroup,
  onBloodGroupChange,
  availability,
  onAvailabilityChange,
  requestStatus,
  onRequestStatusChange,
  urgency,
  onUrgencyChange,
  sortBy,
  onSortChange,
  onReset,
}: DonationFiltersProps) {
  const isDonorsView = viewMode === 'donors';
  const isRequestsView = viewMode === 'requests';
  const isInventoryView = viewMode === 'inventory';

  const hasActiveFilters =
    bloodGroup !== 'all' ||
    (isDonorsView && availability !== 'all') ||
    (isRequestsView && (requestStatus !== 'all' || urgency !== 'all')) ||
    sortBy !== 'default';

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {/* Blood Group Filter - Common across views */}
        <Select value={bloodGroup} onValueChange={onBloodGroupChange}>
          <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 w-[130px] bg-white">
            <SelectValue placeholder="Blood Group" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all" className="text-xs">All Groups</SelectItem>
            {bloodGroups.filter((g) => g !== 'all').map((bg) => (
              <SelectItem key={bg} value={bg} className="text-xs font-bold">
                {bg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View-specific: Donors Availability Filter */}
        {isDonorsView && (
          <Select value={availability} onValueChange={onAvailabilityChange}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 w-[140px] bg-white">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="available" className="text-xs text-emerald-700 font-medium">Available Only</SelectItem>
              <SelectItem value="unavailable" className="text-xs text-slate-500">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* View-specific: Requests Status Filter */}
        {isRequestsView && (
          <Select value={requestStatus} onValueChange={onRequestStatusChange}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 w-[130px] bg-white">
              <SelectValue placeholder="Request Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">All Requests</SelectItem>
              <SelectItem value="active" className="text-xs text-emerald-700 font-medium">Active (Open)</SelectItem>
              <SelectItem value="fulfilled" className="text-xs text-slate-600">Fulfilled</SelectItem>
              <SelectItem value="cancelled" className="text-xs text-rose-700">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* View-specific: Requests Urgency Filter */}
        {isRequestsView && (
          <Select value={urgency} onValueChange={onUrgencyChange}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 w-[130px] bg-white">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">All Urgencies</SelectItem>
              <SelectItem value="critical" className="text-xs text-rose-700 font-bold">Critical Only</SelectItem>
              <SelectItem value="high" className="text-xs text-orange-700 font-medium">High Priority</SelectItem>
              <SelectItem value="normal" className="text-xs text-slate-600">Normal</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Sorting options */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 w-[130px] bg-white">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="default" className="text-xs">Default Order</SelectItem>
            <SelectItem value="blood-group" className="text-xs">Blood Group</SelectItem>
            {isRequestsView && <SelectItem value="urgency" className="text-xs">Urgency</SelectItem>}
            {isRequestsView && <SelectItem value="date" className="text-xs">Required Date</SelectItem>}
            {isDonorsView && <SelectItem value="availability" className="text-xs">Availability</SelectItem>}
          </SelectContent>
        </Select>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 text-xs font-bold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filter Indicators */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 pt-1">
          <span className="text-[11px] font-bold text-slate-400">Active:</span>
          {bloodGroup !== 'all' && (
            <Badge variant="outline" className="text-[10px] rounded-lg bg-teal-50 text-teal-800 border-teal-200 gap-1">
              Group: {bloodGroup}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onBloodGroupChange('all')} />
            </Badge>
          )}
          {isDonorsView && availability !== 'all' && (
            <Badge variant="outline" className="text-[10px] rounded-lg bg-emerald-50 text-emerald-800 border-emerald-200 gap-1">
              Status: {availability}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onAvailabilityChange('all')} />
            </Badge>
          )}
          {isRequestsView && requestStatus !== 'all' && (
            <Badge variant="outline" className="text-[10px] rounded-lg bg-slate-100 text-slate-700 border-slate-200 gap-1">
              Status: {requestStatus}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onRequestStatusChange('all')} />
            </Badge>
          )}
          {isRequestsView && urgency !== 'all' && (
            <Badge variant="outline" className="text-[10px] rounded-lg bg-rose-50 text-rose-800 border-rose-200 gap-1">
              Urgency: {urgency}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onUrgencyChange('all')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
});
