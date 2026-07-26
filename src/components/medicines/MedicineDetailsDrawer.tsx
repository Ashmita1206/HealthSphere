import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Clock, Calendar, User, FileText, Edit, Archive, Trash2 } from 'lucide-react';
import { RefillTracker } from './RefillTracker';
import { MedicineTimeline } from './MedicineTimeline';
import { DoseHistory } from './DoseHistory';
import { MedicineTimingBadges } from './MedicineTimingBadges';
import { parseMedicineDate } from './medicineUtils';
import type { Medicine } from './medicineTypes';
import { useToast } from '@/hooks/use-toast';

interface MedicineDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
  onEdit: (medicine: Medicine) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MedicineDetailsDrawer({
  open,
  onOpenChange,
  medicine,
  onEdit,
  onArchive,
  onDelete,
}: MedicineDetailsDrawerProps) {
  const { toast } = useToast();
  if (!medicine) return null;
  const parsedEndDate = parseMedicineDate(medicine.endDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'missed': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'expired': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'archived': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  // Mock timeline data
  const timelineEvents = [
    {
      id: '1',
      type: 'started' as const,
      date: medicine.startDate || new Date().toISOString(),
      description: 'Medicine started',
    },
  ];

  // Mock dose history
  const doseLogs = [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg rounded-l-3xl border-slate-200 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Pill className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <SheetTitle className="text-lg font-extrabold text-slate-900 font-heading">
                  {medicine.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500">
                  {medicine.dosage} {medicine.strength && `• ${medicine.strength}`}
                </SheetDescription>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEdit(medicine)}
                className="h-8 w-8 rounded-xl focus-visible:ring-2 focus-visible:ring-teal-600"
                aria-label={`Edit ${medicine.name}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {medicine.status !== 'archived' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onArchive(medicine.id)}
                  className="h-8 w-8 rounded-xl text-amber-600 focus-visible:ring-2 focus-visible:ring-amber-600"
                  aria-label={`Archive ${medicine.name}`}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onDelete(medicine.id)}
                className="h-8 w-8 rounded-xl text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-600"
                aria-label={`Delete ${medicine.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] font-bold px-3 py-1 rounded-full ${getStatusColor(medicine.status)}`}>
              {medicine.status}
            </Badge>
            {medicine.adherence && (
              <span className="text-xs font-bold text-slate-600">
                {medicine.adherence}% Adherence
              </span>
            )}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">{medicine.frequency}</span>
            </div>
            <MedicineTimingBadges timing={medicine.timing} />
            {medicine.doctorName && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Dr. {medicine.doctorName}</span>
              </div>
            )}
            {parsedEndDate && (
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  Ends: {parsedEndDate.toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Refill Tracker */}
          {medicine.remainingPills !== undefined &&
            medicine.totalPills !== undefined &&
            medicine.totalPills > 0 && (
              <RefillTracker
                remainingPills={medicine.remainingPills}
                totalPills={medicine.totalPills}
                dailyDose={1}
              />
            )}

          {/* Description */}
          {medicine.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</span>
              </div>
              <p className="text-xs text-slate-600">{medicine.description}</p>
            </div>
          )}

          {/* Instructions */}
          {medicine.instructions && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Instructions</span>
              </div>
              <p className="text-xs text-slate-600">{medicine.instructions}</p>
            </div>
          )}

          {/* Notes */}
          {medicine.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notes</span>
              </div>
              <p className="text-xs text-slate-600">{medicine.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <MedicineTimeline events={timelineEvents} />

          {/* Dose History */}
          <DoseHistory
            logs={doseLogs}
            onLogDose={(status, reason) => {
              // TODO: Backend integration required for dose logging
              toast({
                title: 'Dose log not saved',
                description: `${status}${reason ? `: ${reason}` : ''}. Backend integration is still required.`,
              });
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
