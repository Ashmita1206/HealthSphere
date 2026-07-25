import { memo, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TimelineEvent } from './timelineTypes';

interface TimelineCalendarProps {
  events: TimelineEvent[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export const TimelineCalendar = memo(function TimelineCalendar({
  events,
  onDateSelect,
  selectedDate,
}: TimelineCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, []);

  const getEventsForDate = useCallback((date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.timestamp);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }, [events]);

  const getMonthEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.timestamp);
      return (
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  }, [events, currentMonth]);

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth, getDaysInMonth]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    onDateSelect(date);
  }, [onDateSelect]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const isSelected = useCallback((date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  }, [selectedDate]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
            <Badge className="text-[10px] font-bold bg-slate-100 text-slate-700 border-slate-200">
              {getMonthEvents.length} events
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goToToday}
              className="h-8 w-8 text-xs font-bold rounded-lg"
              title="Go to today"
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 rounded-lg"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 rounded-lg"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-[10px] font-bold text-slate-500 text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          <AnimatePresence mode="popLayout">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayEvents = getEventsForDate(date);
              const hasEvents = dayEvents.length > 0;
              const today = isToday(date);
              const selected = isSelected(date);

              return (
                <motion.button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                  className={`
                    aspect-square rounded-lg text-xs font-bold relative
                    flex flex-col items-center justify-center
                    transition-all duration-200 hover:scale-105
                    ${today
                      ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                      : selected
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : hasEvents
                          ? 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                          : 'text-slate-400 hover:bg-slate-50'
                    }
                  `}
                  aria-label={`Select ${date.toLocaleDateString()}`}
                  aria-pressed={selected}
                >
                  <span>{date.getDate()}</span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-rose-500"
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] font-bold text-rose-600">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
});
