import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shareService, SharedPatientData } from '@/services/shareService';
import { SharedRecordViewer } from '@/components/share/SharedRecordViewer';
import { AccessExpired } from '@/components/share/AccessExpired';
import { Skeleton } from '@/components/ui/skeleton';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ShieldCheck } from 'lucide-react';

export default function SharedViewerPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sharedData, setSharedData] = useState<SharedPatientData | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSharedRecord = async () => {
    if (!token) {
      setErrorStatus('invalid');
      setErrorMessage('No medical share token was provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    try {
      const data = await shareService.getSharedData(token);
      setSharedData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to access shared record';
      setErrorMessage(msg);
      if (msg.toLowerCase().includes('revoked')) {
        setErrorStatus('revoked');
      } else if (msg.toLowerCase().includes('expired')) {
        setErrorStatus('expired');
      } else if (msg.toLowerCase().includes('not found')) {
        setErrorStatus('not_found');
      } else {
        setErrorStatus('invalid');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSharedRecord();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
      {/* Top Clinical Header */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
              Clinical Record Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-800" />
              <span>Read-Only Mode</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
        {loading ? (
          <div className="space-y-6 max-w-5xl mx-auto">
            <Skeleton className="h-44 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : errorStatus ? (
          <AccessExpired
            status={errorStatus}
            message={errorMessage || undefined}
            onRetry={fetchSharedRecord}
          />
        ) : sharedData ? (
          <SharedRecordViewer data={sharedData} />
        ) : (
          <AccessExpired status="not_found" onRetry={fetchSharedRecord} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400">
        <p>HealthSphere Secure Medical Sharing Engine • Confidential Clinical Transmission</p>
      </footer>
    </div>
  );
}
