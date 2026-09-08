import React, { useState } from 'react';
import { Card } from '@/design-system/primitives/Card';
import { Button } from '@/design-system/primitives/Button';
import { Badge } from '@/components/ui/badge';
import { useMedicalShare } from '@/context/ShareContext';
import { useDoctor } from '@/context/DoctorContext';
import { ShareMedicalRecordDialog } from '@/components/share/ShareMedicalRecordDialog';
import { useNavigate } from 'react-router-dom';
import {
  Share2,
  ShieldCheck,
  Clock,
  ArrowRight,
  UserCheck,
  Building2,
  Stethoscope,
} from 'lucide-react';

export const DoctorShareWidget: React.FC = () => {
  const navigate = useNavigate();
  const { shares } = useMedicalShare();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeShares = shares.active.slice(0, 2);
  const totalActive = shares.active.length;

  return (
    <Card variant="base" padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Secure Record Sharing
          </h3>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            totalActive > 0
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {totalActive} Active {totalActive === 1 ? 'Share' : 'Shares'}
        </span>
      </div>

      {/* Content: Recent Active Shares */}
      {activeShares.length > 0 ? (
        <div className="space-y-2">
          {activeShares.map((share) => (
            <div
              key={share._id || share.shareToken}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
                  <UserCheck className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                  <span className="truncate">{share.doctorId?.fullName || 'Physician'}</span>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">
                  {share.doctorId?.hospital || share.doctorId?.specialization || 'Clinical Review'}
                </span>
                <span className="font-mono text-[10px] text-teal-800 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(share.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-700">No Active Doctor Shares</p>
          <p className="text-[11px] text-slate-500">
            Safely share selected prescriptions, lab reports, and vitals with verified physicians.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 text-xs font-bold gap-1.5 h-8"
          onClick={() => setDialogOpen(true)}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Records</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs font-semibold gap-1 h-8"
          onClick={() => navigate('/doctors')}
        >
          <span>Share History</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {/* Dialog */}
      <ShareMedicalRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
};
