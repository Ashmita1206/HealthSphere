import React, { useState } from 'react';
import { Calendar, Clock, Save, Check } from 'lucide-react';

export interface DaySlot {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface AvailabilityCalendarProps {
  initialSlots?: DaySlot[];
  onSave?: (slots: DaySlot[]) => void;
  className?: string;
}

export const DEFAULT_SLOTS: DaySlot[] = [
  { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
  { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
  { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
  { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
  { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 },
  { day: 'Saturday', enabled: true, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30 },
  { day: 'Sunday', enabled: false, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 30 },
];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  initialSlots = DEFAULT_SLOTS,
  onSave,
  className = '',
}) => {
  const [slots, setSlots] = useState<DaySlot[]>(initialSlots);
  const [saved, setSaved] = useState(false);

  const handleToggleDay = (day: string) => {
    setSlots(
      slots.map((s) => (s.day === day ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setSlots(
      slots.map((s) => (s.day === day ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = () => {
    if (onSave) onSave(slots);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      data-testid="availability-calendar"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Consultation Availability Calendar
            </h3>
            <p className="text-xs text-slate-500">Configure weekly booking hours and slot durations</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Schedule Saved' : 'Save Schedule'}</span>
        </button>
      </div>

      <div className="space-y-2">
        {slots.map((slot) => (
          <div
            key={slot.day}
            className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              slot.enabled
                ? 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                : 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`day-${slot.day}`}
                checked={slot.enabled}
                onChange={() => handleToggleDay(slot.day)}
                className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
              />
              <label
                htmlFor={`day-${slot.day}`}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 w-24 cursor-pointer"
              >
                {slot.day}
              </label>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  slot.enabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {slot.enabled ? 'Available' : 'Closed'}
              </span>
            </div>

            {slot.enabled && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <input
                  type="time"
                  value={slot.startTime}
                  aria-label={`${slot.day} Start Time`}
                  onChange={(e) => handleTimeChange(slot.day, 'startTime', e.target.value)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
                <span>to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  aria-label={`${slot.day} End Time`}
                  onChange={(e) => handleTimeChange(slot.day, 'endTime', e.target.value)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-normal">
                  (30m slots)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
