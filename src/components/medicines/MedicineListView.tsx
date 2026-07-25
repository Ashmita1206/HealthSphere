import { memo } from 'react';
import { Archive, Clock, Copy, Pill, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MedicineTimingBadges } from './MedicineTimingBadges';
import { getMedicineExpiryStatus, parseMedicineDate } from './medicineUtils';
import type { Medicine } from './medicineTypes';

interface MedicineListViewProps {
  medicines: Medicine[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClick: (medicine: Medicine) => void;
}

const getStatusColor = (status: Medicine['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'missed':
    case 'expired':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'archived':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'active':
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
};

const getAdherenceColor = (adherence: number) => {
  if (adherence >= 90) return 'text-emerald-600';
  if (adherence >= 70) return 'text-amber-600';
  return 'text-rose-600';
};

export const MedicineListView = memo(function MedicineListView({
  medicines,
  selectedIds,
  onSelect,
  onSelectAll,
  onDelete,
  onArchive,
  onDuplicate,
  onClick,
}: MedicineListViewProps) {
  const allSelected = medicines.length > 0 && medicines.every((m) => selectedIds.has(m.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <div className="col-span-1 flex items-center">
          <Checkbox
            checked={someSelected ? 'indeterminate' : allSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all medicines"
          />
        </div>
        <div className="col-span-3">Medicine</div>
        <div className="col-span-2">Dosage</div>
        <div className="col-span-2">Frequency</div>
        <div className="col-span-1">Remaining</div>
        <div className="col-span-1">Expiry</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Medicine Rows */}
      {medicines.map((medicine) => {
        const expiryStatus = getMedicineExpiryStatus(medicine.endDate);
        const parsedEndDate = parseMedicineDate(medicine.endDate);
        const isSelected = selectedIds.has(medicine.id);

        return (
          <div
            key={medicine.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200/80 bg-white hover:border-teal-200 hover:shadow-sm transition-all items-center"
          >
            {/* Checkbox */}
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(medicine.id)}
                aria-label={`Select ${medicine.name}`}
              />
            </div>

            {/* Medicine Name */}
            <div className="col-span-11 md:col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-900 font-heading truncate">
                  {medicine.name}
                </p>
                {medicine.strength && (
                  <p className="text-[11px] text-slate-500">{medicine.strength}</p>
                )}
              </div>
            </div>

            {/* Dosage */}
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs text-slate-600">{medicine.dosage}</p>
            </div>

            {/* Frequency */}
            <div className="col-span-1 md:col-span-2 space-y-1">
              <p className="text-xs text-slate-600">{medicine.frequency}</p>
              <MedicineTimingBadges timing={medicine.timing} />
            </div>

            {/* Remaining */}
            <div className="col-span-1 md:col-span-1">
              {medicine.remainingPills !== undefined ? (
                <p className="text-xs text-slate-600">{medicine.remainingPills}</p>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
              {medicine.adherence !== undefined && (
                <p className={`text-[10px] font-bold ${getAdherenceColor(medicine.adherence)}`}>
                  {medicine.adherence}%
                </p>
              )}
            </div>

            {/* Expiry */}
            <div className="col-span-1 md:col-span-1">
              {parsedEndDate ? (
                <p className="text-xs text-slate-600">{parsedEndDate.toLocaleDateString()}</p>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
              {expiryStatus && (
                <Badge className={`text-[9px] font-bold mt-1 ${expiryStatus.className}`}>
                  {expiryStatus.label}
                </Badge>
              )}
            </div>

            {/* Status */}
            <div className="col-span-1 md:col-span-1">
              <Badge className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(medicine.status)}`}>
                {medicine.status}
              </Badge>
            </div>

            {/* Actions */}
            <div className="col-span-1 md:col-span-1 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onDuplicate(medicine.id);
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg h-7 w-7"
                title="Duplicate"
                aria-label={`Duplicate ${medicine.name}`}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {medicine.status !== 'archived' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    onArchive(medicine.id);
                  }}
                  className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg h-7 w-7"
                  title="Archive"
                  aria-label={`Archive ${medicine.name}`}
                >
                  <Archive className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(medicine.id);
                }}
                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg h-7 w-7"
                title="Delete"
                aria-label={`Delete ${medicine.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
});
