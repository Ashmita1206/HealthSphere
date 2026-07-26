import { memo } from 'react';
import { Calendar, MapPin, Droplet } from 'lucide-react';

interface DonationHistoryEntry {
  date: string;
  location: string;
  units: number;
}

interface DonationHistoryProps {
  history: DonationHistoryEntry[];
}

export const DonationHistory = memo(function DonationHistory({
  history,
}: DonationHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {history.map((entry, index) => (
        <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Droplet className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900">
                {entry.units} unit{entry.units > 1 ? 's' : ''} donated
              </p>
              <p className="text-[10px] text-slate-500">{formatDate(entry.date)}</p>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{entry.location}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
