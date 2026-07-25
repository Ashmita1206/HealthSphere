import { memo } from 'react';
import { motion } from 'framer-motion';
import { Archive, Clock, Copy, Pill, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MedicineTimingBadges } from './MedicineTimingBadges';
import { getMedicineExpiryStatus, parseMedicineDate } from './medicineUtils';
import type { Medicine } from './medicineTypes';

interface MedicineCardProps {
  medicine: Medicine;
  index: number;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClick: (medicine: Medicine) => void;
}

const getStatusColor = (status: Medicine['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'missed':
    case 'expired':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'archived':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'active':
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
};

const getAdherenceColor = (adherence: number) => {
  if (adherence >= 90) return 'text-emerald-600';
  if (adherence >= 70) return 'text-amber-600';
  return 'text-rose-600';
};

export const MedicineCard = memo(function MedicineCard({
  medicine,
  index,
  onDelete,
  onArchive,
  onDuplicate,
  onClick,
}: MedicineCardProps) {
  const expiryStatus = getMedicineExpiryStatus(medicine.endDate);
  const parsedEndDate = parseMedicineDate(medicine.endDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className="relative rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover bg-white transition-all duration-300 overflow-hidden group cursor-pointer"
      >
        <button
          type="button"
          onClick={() => onClick(medicine)}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
          aria-label={`View details for ${medicine.name}`}
        />
        <CardContent className="relative z-10 p-5 space-y-4 pointer-events-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <Pill className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-teal-800 transition-colors truncate">
                  {medicine.name}
                </h3>
                <p className="text-xs font-bold text-teal-800 mt-0.5">
                  {medicine.dosage || 'Standard Dose'}
                </p>
                {medicine.strength && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {medicine.strength}
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
                  onDuplicate(medicine.id);
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl h-8 w-8 focus-visible:ring-2 focus-visible:ring-teal-600"
                title="Duplicate Medicine"
                aria-label={`Duplicate ${medicine.name}`}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {medicine.status !== 'archived' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    onArchive(medicine.id);
                  }}
                  className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl h-8 w-8 focus-visible:ring-2 focus-visible:ring-amber-600"
                  title="Archive Medicine"
                  aria-label={`Archive ${medicine.name}`}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(medicine.id);
                }}
                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-8 w-8 focus-visible:ring-2 focus-visible:ring-rose-600"
                title="Delete Medicine"
                aria-label={`Delete ${medicine.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{medicine.frequency || 'Daily'}</span>
            </div>

            <MedicineTimingBadges timing={medicine.timing} />

            {(medicine.remainingPills !== undefined ||
              medicine.adherence !== undefined) && (
              <div className="flex items-center justify-between gap-3 text-xs">
                {medicine.remainingPills !== undefined && (
                  <span className="text-slate-500">
                    Remaining: {medicine.remainingPills}
                  </span>
                )}
                {medicine.adherence !== undefined && (
                  <span
                    className={`ml-auto font-bold ${getAdherenceColor(
                      medicine.adherence,
                    )}`}
                  >
                    {medicine.adherence}% Adherence
                  </span>
                )}
              </div>
            )}

            {medicine.doctorName && (
              <p className="text-[11px] text-slate-400">
                Dr. {medicine.doctorName}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
                medicine.status,
              )}`}
            >
              {medicine.status}
            </Badge>
            {expiryStatus && (
              <Badge
                className={`text-[10px] font-bold ${expiryStatus.className}`}
              >
                {expiryStatus.label}
              </Badge>
            )}
            {parsedEndDate && (
              <span className="ml-auto text-[10px] text-slate-400">
                Ends: {parsedEndDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
