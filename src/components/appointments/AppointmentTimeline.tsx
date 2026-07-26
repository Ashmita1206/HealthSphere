import { memo } from 'react';
import { Calendar, Edit2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  doctor_name: string;
  appointment_date: string;
  status?: 'confirmed' | 'completed' | 'cancelled' | 'missed';
  created_at?: string;
  updated_at?: string;
}

interface AppointmentTimelineProps {
  appointment: Appointment;
}

interface TimelineEvent {
  icon: typeof Calendar;
  label: string;
  date: string;
  color: string;
}

export const AppointmentTimeline = memo(function AppointmentTimeline({
  appointment,
}: AppointmentTimelineProps) {
  const events: TimelineEvent[] = [
    {
      icon: Calendar,
      label: 'Appointment Scheduled',
      date: appointment.created_at || appointment.appointment_date,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
  ];

  if (appointment.status === 'completed') {
    events.push({
      icon: CheckCircle2,
      label: 'Appointment Completed',
      date: appointment.updated_at || appointment.appointment_date,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    });
  } else if (appointment.status === 'cancelled') {
    events.push({
      icon: XCircle,
      label: 'Appointment Cancelled',
      date: appointment.updated_at || appointment.appointment_date,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    });
  } else if (appointment.status === 'missed') {
    events.push({
      icon: AlertCircle,
      label: 'Appointment Missed',
      date: appointment.updated_at || appointment.appointment_date,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    });
  } else if (appointment.updated_at && appointment.updated_at !== appointment.created_at) {
    events.push({
      icon: Edit2,
      label: 'Appointment Rescheduled',
      date: appointment.updated_at,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    });
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const Icon = event.icon;
        return (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${event.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900">{event.label}</p>
              <p className="text-[10px] text-slate-500">{formatDate(event.date)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
