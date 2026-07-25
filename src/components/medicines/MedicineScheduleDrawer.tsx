import { memo } from 'react';
import { CalendarDays, Pill } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MedicineTimingBadges } from './MedicineTimingBadges';
import type { Medicine } from './medicineTypes';

interface MedicineScheduleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  medicines: Medicine[] | null | undefined;
}

export const MedicineScheduleDrawer = memo(
  function MedicineScheduleDrawer({
    open,
    onOpenChange,
    date,
    medicines,
  }: MedicineScheduleDrawerProps) {
    const safeMedicines = Array.isArray(medicines) ? medicines : [];
    const formattedDate = date
      ? new Intl.DateTimeFormat(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(date)
      : 'Selected date';

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md rounded-l-3xl border-slate-200 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900 font-heading">
              <CalendarDays className="h-5 w-5 text-teal-700" />
              {formattedDate}
            </SheetTitle>
            <SheetDescription>
              {safeMedicines.length === 0
                ? 'No medicines are scheduled for this day.'
                : `${safeMedicines.length} ${
                    safeMedicines.length === 1 ? 'medicine is' : 'medicines are'
                  } scheduled for this day.`}
            </SheetDescription>
          </SheetHeader>

          {safeMedicines.length === 0 ? (
            <div
              className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center"
              role="status"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                <Pill className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                No medicines scheduled
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Your medicine schedule is clear for this day.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3" role="list">
              {safeMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  role="listitem"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-extrabold text-slate-900">
                        {medicine.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-teal-800">
                        {medicine.dosage || 'Standard dose'}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {medicine.frequency || 'Daily'}
                      </p>
                      <MedicineTimingBadges
                        timing={medicine.timing}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  },
);
