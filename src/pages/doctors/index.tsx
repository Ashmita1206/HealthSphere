import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DoctorDirectory } from '@/components/doctor/DoctorDirectory';
import { ShareHistory } from '@/components/share/ShareHistory';
import { ShareMedicalRecordDialog } from '@/components/share/ShareMedicalRecordDialog';
import { useDoctor } from '@/context/DoctorContext';
import { useMedicalShare } from '@/context/ShareContext';
import {
  Stethoscope,
  Share2,
  ShieldCheck,
  History,
  Lock,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import type { Doctor } from '@/services/doctorService';

export default function DoctorPortalPage() {
  const { doctors, loading: doctorsLoading } = useDoctor();
  const { shares, loading: sharesLoading, revokeShare } = useMedicalShare();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetDoctor, setTargetDoctor] = useState<Doctor | null>(null);

  const handleShareWithDoctor = (doctor: Doctor) => {
    setTargetDoctor(doctor);
    setDialogOpen(true);
  };

  const handleOpenGeneralShare = () => {
    setTargetDoctor(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Page Header */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-teal-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Trust Medical Sharing Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
              Doctor Portal & Record Sharing
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Find verified healthcare specialists and share selected diagnostic reports, prescriptions, and clinical history using expiring, revocable cryptographic access links.
            </p>
          </div>

          <Button
            onClick={handleOpenGeneralShare}
            className="rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-extrabold text-xs sm:text-sm h-11 px-5 shadow-md gap-2 shrink-0"
          >
            <Share2 className="w-4 h-4 text-teal-800" />
            <span>Share Records</span>
          </Button>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">Available Specialists</span>
            <p className="text-lg font-black text-white">{doctors.length} Physicians</p>
          </div>
          <div>
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">Active Shares</span>
            <p className="text-lg font-black text-emerald-300">{shares.active.length} Live</p>
          </div>
          <div>
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">Past Shares</span>
            <p className="text-lg font-black text-slate-300">{shares.expired.length} Expired</p>
          </div>
          <div>
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">Security Protocol</span>
            <p className="text-lg font-black text-teal-300">128-bit Expiring Token</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="directory" className="space-y-6">
        <div className="border-b border-slate-200">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-auto">
            <TabsTrigger
              value="directory"
              className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Specialist Directory</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>Active & Past Shares ({shares.all.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy & Security</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Directory */}
        <TabsContent value="directory" className="mt-0">
          <DoctorDirectory
            doctors={doctors}
            loading={doctorsLoading}
            onShareDoctor={handleShareWithDoctor}
          />
        </TabsContent>

        {/* Tab 2: Share History */}
        <TabsContent value="history" className="mt-0">
          <ShareHistory
            shares={shares}
            loading={sharesLoading}
            onRevoke={revokeShare}
            onCreateNew={handleOpenGeneralShare}
          />
        </TabsContent>

        {/* Tab 3: Security */}
        <TabsContent value="security" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Expiring Cryptographic Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every share generates an individual, high-entropy 128-bit hex token with automatic time-based expiry (1h, 24h, 7d, 30d). Once expired, tokens immediately reject all access attempts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Granular Permission Matrix</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You decide exactly what each specialist sees. Permissions are enforced at the database level: unpermitted medical records are never queried or transmitted over the network.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Immediate One-Click Revocation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Change your mind at any moment. Clicking &quot;Revoke Access&quot; invalidates the token permanently in real-time, severing the doctor&apos;s read-only session with zero delay.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <ShareMedicalRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDoctor={targetDoctor}
      />
    </div>
  );
}
