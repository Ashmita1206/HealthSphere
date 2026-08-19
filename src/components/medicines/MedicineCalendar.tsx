import { memo, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pill, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getMedicinesForDate } from './medicineUtils';
import type { Medicine } from './medicineTypes';

interface MedicineCalendarProps {
  medicines: Medicine[] | null | undefined;
  onDateSelect: (date: Date) => void;
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MedicineCalendar = memo(function MedicineCalendar({
  medicines,
  onDateSelect,
}: MedicineCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = new Date(year, month, day);

      return {
        day,
        date,
        medicines: getMedicinesForDate(medicines, date),
      };
    }).map((dayData, index) => ({
      ...dayData,
      gridColumnStart: index === 0 ? startDay + 1 : undefined,
    }));
  }, [currentDate, medicines]);

  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  const handleResetToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 font-heading">
                Medicine Calendar
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Track doses & medication schedule by date
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isCurrentMonth && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToToday}
                className="h-7 text-xs font-semibold px-2.5 rounded-lg text-teal-700 border-teal-200 hover:bg-teal-50"
              >
                Today
              </Button>
            )}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentDate(
                    (date) =>
                      new Date(date.getFullYear(), date.getMonth() - 1, 1),
                  )
                }
                className="h-7 w-7 rounded-lg hover:bg-white text-slate-700 focus-visible:ring-2 focus-visible:ring-teal-600"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span
                className="text-xs font-bold text-slate-800 min-w-[110px] text-center select-none"
                aria-live="polite"
              >
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentDate(
                    (date) =>
                      new Date(date.getFullYear(), date.getMonth() + 1, 1),
                  )
                }
                className="h-7 w-7 rounded-lg hover:bg-white text-slate-700 focus-visible:ring-2 focus-visible:ring-teal-600"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Day Header Row */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2" aria-hidden="true">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-[10px] font-bold text-slate-400 text-center py-1 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div
          className="grid grid-cols-7 gap-1.5 sm:gap-2"
          role="grid"
          aria-label={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()} medicine schedule`}
        >
          {calendarDays.map(({ day, date, medicines: dayMedicines, gridColumnStart }) => {
            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear();
            const medicineCount = dayMedicines.length;

            return (
              <div
                key={day}
                className="h-12 sm:h-15 w-full"
                style={{ gridColumnStart }}
                role="gridcell"
              >
                <button
                  type="button"
                  onClick={() => onDateSelect(date)}
                  className={`h-full w-full rounded-xl flex flex-col items-center justify-between p-1.5 text-xs font-bold transition-all border ${
                    isToday
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs ring-1 ring-teal-600/30'
                      : medicineCount > 0
                      ? 'bg-white border-slate-200/90 text-slate-800 hover:border-teal-500 hover:bg-teal-50/40'
                      : 'bg-slate-50/60 border-slate-100 text-slate-600 hover:bg-slate-100/80 hover:border-slate-300'
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600`}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${monthNames[currentDate.getMonth()]} ${day}, ${currentDate.getFullYear()}: ${
                    medicineCount === 0
                      ? 'no medicines scheduled'
                      : `${medicineCount} ${
                          medicineCount === 1 ? 'medicine' : 'medicines'
                        } scheduled`
                  }`}
                >
                  <span className={`text-[11px] sm:text-xs font-extrabold ${isToday ? 'text-teal-700' : 'text-slate-700'}`}>
                    {day}
                  </span>

                  <div className="h-3 flex items-center justify-center gap-0.5" aria-hidden="true">
                    {medicineCount > 0 ? (
                      <div className="flex items-center gap-0.5 bg-teal-100/80 text-teal-800 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                        <Pill className="h-2.5 w-2.5 text-teal-700 shrink-0" />
                        <span className="hidden sm:inline">{medicineCount}</span>
                      </div>
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
