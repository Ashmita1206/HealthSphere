import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MedicineSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MedicineSearch = memo(function MedicineSearch({ value, onChange, placeholder = 'Search medicines...' }: MedicineSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 pl-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
        aria-label="Search medicines"
      />
    </div>
  );
});
