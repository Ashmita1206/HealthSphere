import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Droplet,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Ban,
  Pencil,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface BloodRequest {
  id: string;
  userId?: string;
  patientName: string;
  bloodGroup: string;
  componentType?: 'whole_blood' | 'prbc' | 'platelets' | 'ffp' | 'cryo' | string;
  hospital: string;
  approximateArea?: string;
  unitsRequired: number;
  requiredDate: string;
  urgency: 'critical' | 'high' | 'normal';
  status: 'active' | 'fulfilled' | 'cancelled';
  contactNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  isOwner?: boolean;
}

interface BloodRequestCardProps {
  request: BloodRequest;
  index: number;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onFulfill: (id: string) => void;
  onEdit: (request: BloodRequest) => void;
  onClick: (request: BloodRequest) => void;
}

const bloodGroupColors: Record<string, string> = {
  'A+': 'bg-rose-50 text-rose-800 border-rose-200',
  'A-': 'bg-orange-50 text-orange-800 border-orange-200',
  'B+': 'bg-teal-50 text-teal-800 border-teal-200',
  'B-': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'AB+': 'bg-purple-50 text-purple-800 border-purple-200',
  'AB-': 'bg-pink-50 text-pink-800 border-pink-200',
  'O+': 'bg-teal-50 text-teal-800 border-teal-200',
  'O-': 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const urgencyColors: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-800 border-rose-300',
  high: 'bg-orange-50 text-orange-800 border-orange-200',
  normal: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  fulfilled: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const componentLabels: Record<string, string> = {
  whole_blood: 'Whole Blood',
  prbc: 'PRBC (Red Cells)',
  platelets: 'Platelets',
  ffp: 'FFP (Plasma)',
  cryo: 'Cryoprecipitate',
};

function formatDateSafe(dateString?: string): { formatted: string; isPastDue: boolean } {
  if (!dateString) {
    return { formatted: 'Date as scheduled', isPastDue: false };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { formatted: 'Date as scheduled', isPastDue: false };
  }

  const now = new Date();
  const isPastDue = date.getTime() < now.getTime();

  const formatted = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return { formatted, isPastDue };
}

export const BloodRequestCard = memo(function BloodRequestCard({
  request,
  index,
  onDelete,
  onCancel,
  onFulfill,
  onEdit,
  onClick,
}: BloodRequestCardProps) {
  const { formatted: formattedDate, isPastDue } = formatDateSafe(request.requiredDate);
  const isCritical = request.urgency === 'critical';
  const isOverdue = isPastDue && request.status === 'active';
  const componentLabel = componentLabels[request.componentType || 'whole_blood'] || 'Whole Blood';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Card
        className={`rounded-2xl border shadow-sm hover:shadow-md bg-white transition-all duration-200 overflow-hidden group cursor-pointer relative ${
          isCritical && request.status === 'active'
            ? 'border-rose-300 ring-1 ring-rose-200/50'
            : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <button
          type="button"
          onClick={() => onClick(request)}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700"
          aria-label={`View details for ${request.patientName}`}
        />

        <CardContent className="relative z-10 p-5 space-y-4 pointer-events-none">
          {/* Top Bar: Icon, Title & Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-transform group-hover:scale-105 ${
                  isCritical
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-teal-50 border border-teal-100 text-teal-800'
                }`}
              >
                {isCritical ? (
                  <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <Droplet className="w-6 h-6 stroke-[2.2]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading truncate group-hover:text-teal-800 transition-colors">
                    {request.patientName || 'Blood Recipient'}
                  </h3>
                  {request.isOwner && (
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-teal-100 text-teal-800">
                      My Request
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                      bloodGroupColors[request.bloodGroup] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {request.bloodGroup}
                  </Badge>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {request.unitsRequired} unit{request.unitsRequired > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500">{componentLabel}</span>
                </div>
              </div>
            </div>

            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${statusColors[request.status]}`}
            >
              {request.status}
            </Badge>
          </div>

          {/* Hospital & Location */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">{request.hospital}</span>
              {request.approximateArea && (
                <span className="text-slate-400 truncate">({request.approximateArea})</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                Required by: {formattedDate}
              </span>
              {isOverdue && (
                <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-sm">
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Badge
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${urgencyColors[request.urgency]}`}
              >
                {request.urgency}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {/* Contextual actions for owner */}
              {request.isOwner ? (
                <>
                  {request.status === 'active' && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(request);
                        }}
                        className="h-8 text-xs font-bold rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50"
                        title="Edit Request"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onFulfill(request.id);
                        }}
                        className="h-8 text-xs font-bold rounded-lg border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                        title="Mark as Fulfilled"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Fulfill
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCancel(request.id);
                        }}
                        className="h-8 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                        title="Cancel Request"
                      >
                        <Ban className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(request.id);
                    }}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-8 w-8"
                    title="Delete Request"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                /* Non-owner action: Volunteer */
                request.status === 'active' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClick(request);
                    }}
                    className="h-8 text-xs font-bold rounded-lg border-teal-200 text-teal-800 hover:bg-teal-50"
                  >
                    <HeartHandshake className="h-3.5 w-3.5 mr-1" />
                    Volunteer
                  </Button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
