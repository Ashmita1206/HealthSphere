import { memo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AppointmentSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const AppointmentSearch = memo(function AppointmentSearch({
  value,
  onChange,
  placeholder = 'Search appointments...',
}: AppointmentSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 pl-10"
        aria-label="Search appointments"
      />
    </div>
  );
});
