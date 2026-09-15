import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SharePermissions } from './SharePermissions';
import { ShareTokenCard } from './ShareTokenCard';
import {
  ShieldCheck,
  Share2,
  Clock,
  Check,
  Building2,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useDoctor } from '@/context/DoctorContext';
import { useMedicalShare } from '@/context/ShareContext';
import type { Doctor } from '@/services/doctorService';
import type {
  SharePermissions as PermissionsType,
  CreateShareResponse,
} from '@/services/shareService';

interface ShareMedicalRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDoctor?: Doctor | null;
  onShareCreated?: (res: CreateShareResponse) => void;
}

const DEFAULT_PERMISSIONS: PermissionsType = {
  profile: true,
  reports: true,
  medicines: true,
  appointments: true,
  timeline: true,
  analytics: true,
  emergency: true,
};

const EXPIRY_OPTIONS = [
  { value: '1h', label: '1 Hour', description: 'Urgent / Single Visit' },
  { value: '24h', label: '24 Hours', description: 'Standard Consultation (Recommended)' },
  { value: '7d', label: '7 Days', description: 'Post-Op / Care Episode' },
  { value: '30d', label: '30 Days', description: 'Ongoing Clinical Care' },
];

export const ShareMedicalRecordDialog: React.FC<ShareMedicalRecordDialogProps> = ({
  open,
  onOpenChange,
  defaultDoctor,
  onShareCreated,
}) => {
  const { doctors, fetchDoctors } = useDoctor();
  const { createShare } = useMedicalShare();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [permissions, setPermissions] = useState<PermissionsType>(DEFAULT_PERMISSIONS);
  const [expiryDuration, setExpiryDuration] = useState<string>('24h');
  const [generating, setGenerating] = useState(false);
  const [createdShare, setCreatedShare] = useState<CreateShareResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (defaultDoctor) {
        setSelectedDoctorId(defaultDoctor._id || defaultDoctor.doctorId);
      } else if (doctors.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(doctors[0]._id || doctors[0].doctorId);
      }
      setCreatedShare(null);
      setErrorMessage(null);
    }
  }, [open, defaultDoctor, doctors]);

  const selectedDoctorObj = doctors.find(
    (d) => d._id === selectedDoctorId || d.doctorId === selectedDoctorId
  ) || defaultDoctor;

  const handleGenerateShare = async () => {
    if (!selectedDoctorId) {
      setErrorMessage('Please select a doctor to share your records with.');
      return;
    }

    setGenerating(true);
    setErrorMessage(null);
    try {
      const response = await createShare({
        doctorId: selectedDoctorId,
        permissions,
        expiryDuration,
      });
      setCreatedShare(response);
      if (onShareCreated) {
        onShareCreated(response);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate share link';
      setErrorMessage(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setCreatedShare(null);
    setPermissions(DEFAULT_PERMISSIONS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-white font-heading">
                Share Medical Records
              </DialogTitle>
              <DialogDescription className="text-xs text-teal-200 mt-0.5">
                Generate an encrypted, expiring access token for authorized physicians
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {createdShare ? (
            // Success Token Result Screen
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Share Link Generated Successfully</p>
                  <p className="text-[11px] text-emerald-700">
                    Your medical records are now accessible via this secure token until expiration.
                  </p>
                </div>
              </div>

              <ShareTokenCard
                shareToken={createdShare.shareToken}
                shareLink={createdShare.shareLink}
                doctorName={createdShare.doctor?.fullName || selectedDoctorObj?.fullName}
                hospital={createdShare.doctor?.hospital || selectedDoctorObj?.hospital}
                expiresAt={createdShare.expiresAt}
                permissions={createdShare.permissions}
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="rounded-xl text-xs font-bold"
                >
                  Share With Another Doctor
                </Button>
                <Button
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white px-5"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            // Configuration Flow
            <div className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* 1. Select Doctor */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Select Physician
                </Label>
                <Select
                  value={selectedDoctorId}
                  onValueChange={setSelectedDoctorId}
                  disabled={generating}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 text-xs">
                    <SelectValue placeholder="Choose a registered physician..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {doctors.map((doc) => (
                      <SelectItem
                        key={doc._id || doc.doctorId}
                        value={doc._id || doc.doctorId}
                        className="text-xs py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{doc.fullName}</span>
                          <span className="text-[11px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                            {doc.specialization}
                          </span>
                          {doc.hospital && (
                            <span className="text-[11px] text-slate-400 truncate">
                              • {doc.hospital}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDoctorObj && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-800" />
                      <span className="font-bold text-slate-800">{selectedDoctorObj.fullName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      License: {selectedDoctorObj.licenseNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Choose Permissions */}
              <div className="space-y-2">
                <SharePermissions
                  permissions={permissions}
                  onChange={setPermissions}
                  disabled={generating}
                />
              </div>

              {/* 3. Expiry Duration */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-800" />
                  <span>3. Access Validity Window</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EXPIRY_OPTIONS.map((opt) => {
                    const isSelected = expiryDuration === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExpiryDuration(opt.value)}
                        disabled={generating}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-xs font-bold">{opt.label}</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  onClick={handleGenerateShare}
                  disabled={generating || !selectedDoctorId}
                  className="w-full h-11 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-xs gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {generating ? 'Generating Secure Token...' : 'Create Secure Share Link'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
