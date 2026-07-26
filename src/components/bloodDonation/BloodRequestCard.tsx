import { memo } from 'react';
import { motion } from 'framer-motion';
import { Droplet, MapPin, Calendar, AlertTriangle, CheckCircle2, Trash2, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  hospital: string;
  unitsRequired: number;
  requiredDate: string;
  urgency: 'critical' | 'high' | 'normal';
  status: 'active' | 'fulfilled' | 'cancelled';
  contactNumber?: string;
  notes?: string;
}

interface BloodRequestCardProps {
  request: BloodRequest;
  index: number;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onFulfill: (id: string) => void;
  onClick: (request: BloodRequest) => void;
}

const bloodGroupColors: Record<string, string> = {
  'A+': 'bg-red-50 text-red-700 border-red-200',
  'A-': 'bg-orange-50 text-orange-700 border-orange-200',
  'B+': 'bg-blue-50 text-blue-700 border-blue-200',
  'B-': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'AB+': 'bg-purple-50 text-purple-700 border-purple-200',
  'AB-': 'bg-pink-50 text-pink-700 border-pink-200',
  'O+': 'bg-teal-50 text-teal-700 border-teal-200',
  'O-': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const urgencyColors: Record<string, string> = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  fulfilled: 'bg-slate-50 text-slate-500 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const BloodRequestCard = memo(function BloodRequestCard({
  request,
  index,
  onDelete,
  onArchive,
  onFulfill,
  onClick,
}: BloodRequestCardProps) {
  const requiredDate = new Date(request.requiredDate);
  const isUrgent = request.urgency === 'critical';
  const isPastDue = requiredDate < new Date() && request.status === 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={`rounded-2xl border shadow-sm hover:shadow-card-hover bg-white transition-all duration-300 overflow-hidden group cursor-pointer ${
        isUrgent ? 'border-rose-300' : 'border-slate-200/80'
      }`}>
        <button
          type="button"
          onClick={() => onClick(request)}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-600"
          aria-label={`View details for ${request.patientName}`}
        />
        <CardContent className="relative z-10 p-5 space-y-4 pointer-events-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform ${
                isUrgent ? 'bg-rose-50 border border-rose-100 text-rose-700' : 'bg-blue-50 border border-blue-100 text-blue-700'
              }`}>
                {isUrgent ? <AlertTriangle className="w-7 h-7 stroke-[2.2]" /> : <Droplet className="w-7 h-7 stroke-[2.2]" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-rose-800 transition-colors">
                  {request.patientName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`text-xs font-bold uppercase tracking-wider ${bloodGroupColors[request.bloodGroup] || bloodGroupColors['O+']}`}
                  >
                    {request.bloodGroup}
                  </Badge>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500">{request.unitsRequired} unit{request.unitsRequired > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider ${statusColors[request.status]}`}
            >
              {request.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{request.hospital}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className={`font-medium ${isPastDue ? 'text-rose-600' : 'text-slate-700'}`}>
              Required: {requiredDate.toLocaleDateString()}
            </span>
            {isPastDue && (
              <Badge className="text-[10px] font-bold bg-rose-100 text-rose-700 border-rose-300">
                Overdue
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider ${urgencyColors[request.urgency]}`}
            >
              {request.urgency}
            </Badge>

            <div className="flex items-center gap-1 pointer-events-auto">
              {request.status === 'active' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onFulfill(request.id);
                  }}
                  className="h-8 text-xs font-bold rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  title="Mark as Fulfilled"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Fulfill
                </Button>
              )}
              {request.status === 'active' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onArchive(request.id);
                  }}
                  className="h-8 text-xs font-bold rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50"
                  title="Cancel Request"
                >
                  <Archive className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
