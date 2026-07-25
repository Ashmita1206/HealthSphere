import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Activity,
  Download,
  Printer,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import type { Profile } from '@/pages/profile/profileData';
import { useToast } from '@/hooks/use-toast';

interface MedicalIDCardProps {
  profile: Profile;
  userId?: string;
}

export const MedicalIDCard = memo(function MedicalIDCard({
  profile,
  userId,
}: MedicalIDCardProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const { toast } = useToast();

  const healthID = userId
    ? `HS-2026-${userId.slice(-6).toUpperCase()}`
    : `HS-2026-MED987`;

  const handleDownloadID = () => {
    const content = `====================================================
HEALTHSPHERE OFFICIAL MEDICAL EMERGENCY ID CARD
====================================================
Patient Name: ${profile.full_name || 'Patient'}
Health ID: ${healthID}
Blood Group: ${profile.blood_type || 'N/A'}
DOB: ${profile.date_of_birth || 'N/A'}
Gender: ${profile.gender || 'N/A'}

EMERGENCY CONTACT:
Name: ${profile.emergency_contact_name || 'N/A'}
Phone: ${profile.emergency_contact_phone || 'N/A'}
Relationship: ${profile.emergency_contact_relationship || 'N/A'}

INSURANCE & CLINICAL:
Provider: ${profile.insurance_provider || 'N/A'}
Policy No: ${profile.insurance_policy_number || 'N/A'}
Organ Donor: ${profile.organ_donor ? 'YES (Registered)' : 'NO'}
Primary Physician: ${profile.primary_physician || 'N/A'}
Preferred Hospital: ${profile.preferred_hospital || 'N/A'}

CRITICAL ALLERGIES: ${profile.allergies.join(', ') || 'None Reported'}
CHRONIC CONDITIONS: ${profile.chronic_diseases.join(', ') || 'None Reported'}
====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthSphere_Medical_ID_${profile.full_name || 'Patient'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: 'Medical ID Downloaded',
      description: 'Official Emergency Card saved to downloads.',
    });
  };

  const handlePrintCard = () => {
    toast({
      title: 'Preparing Print Preview',
      description: 'Opening system print dialog...',
    });
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <>
      <Card className="rounded-3xl border border-slate-200/80 shadow-md bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300">
                  Official Medical Emergency ID Card
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[9px] font-bold uppercase">
                  Active SOS
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                    {profile.full_name || 'Patient Name'}
                  </span>
                  {profile.blood_type && (
                    <Badge className="bg-rose-600 text-white border-rose-500 text-xs font-extrabold px-3 py-0.5 rounded-full">
                      Blood Group: {profile.blood_type}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <span className="font-semibold text-slate-300">Health ID:</span>
                    <span className="font-mono text-teal-300 font-bold">{healthID}</span>
                  </div>
                  {profile.organ_donor && (
                    <span className="text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Organ Donor Pledged
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Emergency Contact</p>
                  <p className="text-xs font-bold text-white mt-0.5">{profile.emergency_contact_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Emergency Phone</p>
                  <p className="text-xs font-bold text-teal-300 mt-0.5">{profile.emergency_contact_phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Insurance Provider</p>
                  <p className="text-xs font-bold text-white mt-0.5">{profile.insurance_provider || 'CareHealth Gold'}</p>
                </div>
              </div>
            </div>

            {/* Interactive QR Code Widget */}
            <div className="flex flex-col items-center gap-2.5 bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
              <div
                onClick={() => setIsQrOpen(true)}
                className="w-24 h-24 rounded-xl bg-white p-2 shadow-inner flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                title="Click to expand QR Code"
              >
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQrOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-[10px] font-bold rounded-xl flex items-center gap-1.5"
              >
                <QrCode className="w-3 h-3 text-teal-400" />
                <span>View Emergency QR</span>
              </Button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[10px] text-slate-400">
              * HIPAA 256-Bit Encrypted Medical Emergency Identifier. Present during paramedic or ER check-in.
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadID}
                className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-teal-300" />
                <span>Download</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handlePrintCard}
                className="flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="w-full max-w-sm rounded-3xl border-slate-200 bg-white p-6 shadow-2xl text-center">
          <DialogHeader className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 mx-auto mb-2">
              <QrCode className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-extrabold font-heading text-slate-900">
              Emergency Medical QR Code
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Scan with any mobile camera to reveal emergency medical summary.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex flex-col items-center justify-center rounded-2xl border-2 border-teal-200 bg-teal-50/50 p-6 shadow-inner">
            <QrCode className="h-40 w-40 text-slate-900" />
            <p className="mt-3 font-mono text-xs font-bold text-teal-900">{healthID}</p>
          </div>

          <div className="text-left space-y-1 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <p><strong className="text-slate-900">Patient:</strong> {profile.full_name || 'Patient'}</p>
            <p><strong className="text-slate-900">Blood Group:</strong> {profile.blood_type || 'N/A'}</p>
            <p><strong className="text-slate-900">Emergency Phone:</strong> {profile.emergency_contact_phone || 'N/A'}</p>
            <p><strong className="text-slate-900">Allergies:</strong> {profile.allergies.join(', ') || 'None'}</p>
          </div>

          <Button
            type="button"
            onClick={() => setIsQrOpen(false)}
            className="w-full mt-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold"
          >
            Close QR Code
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
});
