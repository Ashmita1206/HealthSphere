import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  History,
  Building2,
  Calendar,
  Lock,
} from 'lucide-react';
import type { MedicalShareItem, SharesData } from '@/services/shareService';

interface ShareHistoryProps {
  shares: SharesData;
  loading?: boolean;
  onRevoke: (token: string) => Promise<void>;
  onCreateNew?: () => void;
}

export const ShareHistory: React.FC<ShareHistoryProps> = ({
  shares,
  loading = false,
  onRevoke,
  onCreateNew,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'revoked'>('active');
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const getFilteredShares = (): MedicalShareItem[] => {
    switch (activeTab) {
      case 'active':
        return shares.active;
      case 'expired':
        return shares.expired;
      case 'revoked':
        return shares.revoked;
      default:
        return shares.all;
    }
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/#/shared/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevoke = async (token: string) => {
    setRevokingToken(token);
    try {
      await onRevoke(token);
    } finally {
      setRevokingToken(null);
    }
  };

  const filtered = getFilteredShares();

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-white text-teal-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Active</span>
            <span className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded-full font-mono">
              {shares.active.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('expired')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'expired'
                ? 'bg-white text-amber-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Expired</span>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded-full font-mono">
              {shares.expired.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('revoked')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'revoked'
                ? 'bg-white text-rose-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Revoked</span>
            <span className="text-[10px] bg-rose-50 text-rose-800 px-1.5 py-0.2 rounded-full font-mono">
              {shares.revoked.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
              {shares.all.length}
            </span>
          </button>
        </div>

        {onCreateNew && (
          <Button
            size="sm"
            onClick={onCreateNew}
            className="text-xs font-bold rounded-xl bg-teal-800 hover:bg-teal-900 text-white h-9 px-4"
          >
            + New Share
          </Button>
        )}
      </div>

      {/* Shares List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isItemActive = item.status === 'active';
            const isItemRevoked = item.status === 'revoked';
            const isItemExpired = item.status === 'expired' || new Date() > new Date(item.expiresAt);

            const doctorName = item.doctorId?.fullName || 'Physician';
            const hospital = item.doctorId?.hospital;
            const specialization = item.doctorId?.specialization;

            const activePermissions = Object.entries(item.permissions || {})
              .filter(([_, val]) => Boolean(val))
              .map(([key]) => key);

            return (
              <Card
                key={item._id || item.shareToken}
                className="rounded-2xl border border-slate-200/90 shadow-2xs bg-white overflow-hidden hover:border-teal-500/40 transition-colors"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        {doctorName}
                      </h4>
                      {specialization && (
                        <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                          {specialization}
                        </span>
                      )}
                      {isItemActive && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Active Session
                        </Badge>
                      )}
                      {isItemRevoked && (
                        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] gap-1">
                          <Lock className="w-3 h-3" />
                          Revoked
                        </Badge>
                      )}
                      {isItemExpired && !isItemRevoked && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] gap-1">
                          <Clock className="w-3 h-3" />
                          Expired
                        </Badge>
                      )}
                    </div>

                    {hospital && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hospital}</span>
                      </div>
                    )}

                    {/* Permissions Badges */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                        Shared:
                      </span>
                      {activePermissions.map((perm) => (
                        <span
                          key={perm}
                          className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md capitalize"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>

                    {/* Timing details */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono flex-wrap">
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Expires: {new Date(item.expiresAt).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(item.shareToken)}
                      className="h-8 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50 gap-1"
                      title="Copy Share Link"
                    >
                      {copiedToken === item.shareToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </Button>

                    {isItemActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(item.shareToken)}
                        disabled={revokingToken === item.shareToken}
                        className="h-8 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 rounded-xl"
                      >
                        {revokingToken === item.shareToken ? 'Revoking...' : 'Revoke'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-2xl border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 capitalize">
            No {activeTab !== 'all' ? activeTab : ''} Medical Shares
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'You do not have any currently active sharing tokens with physicians.'
              : `No ${activeTab} medical record sharing history recorded.`}
          </p>
          {onCreateNew && (
            <Button
              size="sm"
              onClick={onCreateNew}
              className="rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white"
            >
              Share Records with a Doctor
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
