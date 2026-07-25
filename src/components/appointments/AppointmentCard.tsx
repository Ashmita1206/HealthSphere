import { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Stethoscope, Building2, Trash2, Edit2, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Appointment {
  id: string;
  doctor_name: string;
  specialty?: string;
  hospital?: string;
  appointment_date: string;
  status?: 'confirmed' | 'completed' | 'cancelled' | 'missed';
  notes?: string;
  purpose?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (appointment: Appointment) => void;
  onClick: (appointment: Appointment) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'missed':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'confirmed':
    default:
      return 'bg-teal-50 text-teal-700 border-teal-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle2;
    case 'cancelled':
      return XCircle;
    case 'missed':
      return AlertCircle;
    default:
      return Calendar;
  }
};

export const AppointmentCard = memo(function AppointmentCard({
  appointment,
  index,
  onDelete,
  onEdit,
  onClick,
}: AppointmentCardProps) {
  const StatusIcon = getStatusIcon(appointment.status || 'confirmed');
  const appointmentDate = new Date(appointment.appointment_date);
  const isToday = appointmentDate.toDateString() === new Date().toDateString();
  const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover bg-white transition-all duration-300 overflow-hidden group cursor-pointer">
        <button
          type="button"
          onClick={() => onClick(appointment)}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
          aria-label={`View details for ${appointment.doctor_name}`}
        />
        <CardContent className="relative z-10 p-5 space-y-4 pointer-events-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-teal-800 transition-colors truncate">
                  {appointment.doctor_name}
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  {appointment.specialty ? `${appointment.specialty}` : 'Specialist'}
                  {appointment.hospital && ` • ${appointment.hospital}`}
                </p>
                {appointment.purpose && (
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {appointment.purpose}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 pointer-events-auto">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(appointment);
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl h-8 w-8"
                title="Edit Appointment"
                aria-label={`Edit ${appointment.doctor_name}`}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(appointment.id);
                }}
                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-8 w-8"
                title="Cancel Appointment"
                aria-label={`Cancel ${appointment.doctor_name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-teal-700" />
            <span className="font-bold text-teal-800">
              {appointmentDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span>•</span>
            <span>{appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(appointment.status || 'confirmed')}`}
            >
              {appointment.status || 'Confirmed'}
            </Badge>
            {(isToday || isTomorrow) && (
              <Badge className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                {isToday ? 'Today' : 'Tomorrow'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
