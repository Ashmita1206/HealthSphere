import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Clock, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessExpiredProps {
  status?: 'expired' | 'revoked' | 'not_found' | 'invalid' | string;
  message?: string;
  expiresAt?: string;
  onRetry?: () => void;
}

export const AccessExpired: React.FC<AccessExpiredProps> = ({
  status = 'expired',
  message,
  expiresAt,
  onRetry,
}) => {
  const navigate = useNavigate();

  const isRevoked = status === 'revoked';
  const isNotFound = status === 'not_found' || status === 'invalid';

  const title = isRevoked
    ? 'Access Revoked by Patient'
    : isNotFound
    ? 'Invalid Medical Share Link'
    : 'Medical Share Link Expired';

  const description =
    message ||
    (isRevoked
      ? 'The patient has explicitly revoked access permissions for this medical record session.'
      : isNotFound
      ? 'This sharing link could not be verified. It may have been removed or entered incorrectly.'
      : 'This secure access link has passed its authorized validity window to protect patient privacy.');

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full rounded-3xl border border-slate-200/90 shadow-lg bg-white overflow-hidden text-center">
        {/* Top Warning Banner */}
        <div
          className={`p-6 ${
            isRevoked
              ? 'bg-rose-50 border-b border-rose-100 text-rose-800'
              : 'bg-amber-50 border-b border-amber-100 text-amber-800'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-xs ${
              isRevoked
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isRevoked ? (
              <Lock className="w-8 h-8" />
            ) : isNotFound ? (
              <ShieldAlert className="w-8 h-8" />
            ) : (
              <Clock className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-base font-extrabold font-heading mt-3">
            {title}
          </h2>
          <span className="inline-block mt-1 text-[11px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/60 text-slate-700">
            Security Status: {status.toUpperCase()}
          </span>
        </div>

        <CardContent className="p-6 space-y-5 text-center">
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {description}
          </p>

          {expiresAt && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 font-mono">
              Session Expiration: {new Date(expiresAt).toLocaleString()}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 text-xs text-slate-700 text-left space-y-1">
            <span className="font-bold text-teal-900 block">Why did this happen?</span>
            <p className="text-[11px] text-slate-500 leading-normal">
              HealthSphere implements strict zero-trust expiring access tokens and patient-directed revocations to maintain HIPAA and clinical data confidentiality standards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="w-full text-xs font-bold rounded-xl h-10 gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => navigate('/')}
              className="w-full text-xs font-bold rounded-xl h-10 bg-teal-800 hover:bg-teal-900 text-white gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to HealthSphere</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
