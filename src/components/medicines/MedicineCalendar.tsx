import { memo, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pill } from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
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

  const today = new Date();

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-extrabold text-slate-900 font-heading">
            Medicine Calendar
          </h4>
          <div className="flex items-center gap-2">
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
              className="h-7 w-7 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span
              className="text-xs font-bold text-slate-700 min-w-[108px] text-center"
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
              className="h-7 w-7 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2" aria-hidden="true">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-[10px] font-bold text-slate-500 text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-7 gap-1"
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
                className="aspect-square"
                style={{ gridColumnStart }}
                role="gridcell"
              >
                <button
                  type="button"
                  onClick={() => onDateSelect(date)}
                  className={`h-full w-full rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 ${
                    isToday ? 'bg-teal-100 text-teal-700' : 'text-slate-700'
                  }`}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${monthNames[currentDate.getMonth()]} ${day}, ${currentDate.getFullYear()}: ${
                    medicineCount === 0
                      ? 'no medicines scheduled'
                      : `${medicineCount} ${
                          medicineCount === 1 ? 'medicine' : 'medicines'
                        } scheduled`
                  }`}
                >
                  <span>{day}</span>
                  {medicineCount > 0 && (
                    <div className="flex gap-0.5 mt-0.5" aria-hidden="true">
                      {Array.from({ length: Math.min(medicineCount, 3) }).map(
                        (_, index) => (
                          <Pill
                            key={`${day}-medicine-${index}`}
                            className="h-2 w-2 text-teal-600"
                          />
                        ),
                      )}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
