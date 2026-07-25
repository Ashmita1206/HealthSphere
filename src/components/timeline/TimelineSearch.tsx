import { memo } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimelineSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const TimelineSearch = memo(function TimelineSearch({
  value,
  onChange,
}: TimelineSearchProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search title, doctor, hospital, medicine, report, or keyword..."
        className="h-11 rounded-xl border-slate-200 pl-10 pr-10 text-xs focus-visible:ring-teal-600"
        aria-label="Search health timeline"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange('')}
          className="absolute right-1 top-1 h-9 w-9 rounded-lg text-slate-400 hover:text-slate-700"
          aria-label="Clear timeline search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});
