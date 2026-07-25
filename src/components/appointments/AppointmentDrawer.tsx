import { memo } from 'react';
import { X, Calendar, Clock, Stethoscope, Building2, Phone, Mail, FileText, Edit2, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { AppointmentTimeline } from './AppointmentTimeline';

interface Appointment {
  id: string;
  doctor_name: string;
  specialty?: string;
  hospital?: string;
  appointment_date: string;
  status?: 'confirmed' | 'completed' | 'cancelled' | 'missed';
  notes?: string;
  purpose?: string;
  phone?: string;
  email?: string;
  preparation_instructions?: string;
}

interface AppointmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'missed':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-teal-50 text-teal-700 border-teal-200';
  }
};

export const AppointmentDrawer = memo(function AppointmentDrawer({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onArchive,
  onDelete,
}: AppointmentDrawerProps) {
  if (!appointment) return null;

  const appointmentDate = new Date(appointment.appointment_date);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md rounded-l-3xl border-slate-200 p-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl font-extrabold text-slate-900 font-heading">
                  {appointment.doctor_name}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 mt-1">
                  {appointment.specialty || 'Specialist'}
                </SheetDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="shrink-0 h-8 w-8 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Status Badge */}
          <Badge className={`text-xs font-bold uppercase tracking-wider ${getStatusColor(appointment.status || 'confirmed')}`}>
            {appointment.status || 'Confirmed'}
          </Badge>

          {/* Appointment Details */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Date & Time
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {appointmentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-600">
                    {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {appointment.hospital && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Hospital / Clinic
                    </p>
                    <p className="text-sm font-bold text-slate-900">{appointment.hospital}</p>
                  </div>
                </div>
              )}

              {appointment.purpose && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Purpose
                    </p>
                    <p className="text-sm font-bold text-slate-900">{appointment.purpose}</p>
                  </div>
                </div>
              )}

              {appointment.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Contact
                    </p>
                    <p className="text-sm font-bold text-slate-900">{appointment.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {appointment.preparation_instructions && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Preparation Instructions
                </p>
                <p className="text-xs text-amber-900">{appointment.preparation_instructions}</p>
              </div>
            )}

            {appointment.notes && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Notes
                </p>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Appointment History
            </p>
            <AppointmentTimeline appointment={appointment} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(appointment)}
              className="flex-1 h-9 text-xs font-bold rounded-lg"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onArchive(appointment.id)}
                className="flex-1 h-9 text-xs font-bold rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <Archive className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDelete(appointment.id)}
              className="flex-1 h-9 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});
