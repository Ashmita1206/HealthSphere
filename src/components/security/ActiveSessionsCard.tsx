import React, { useState } from 'react';
import { Laptop, Smartphone, Tablet, Globe, Trash2, Shield, RefreshCw } from 'lucide-react';
import { ActiveSession } from '../../services/securityService';

interface ActiveSessionsCardProps {
  sessions: ActiveSession[];
  onRevoke: (id: string) => Promise<void>;
  onRevokeOthers: () => Promise<void>;
  isLoading?: boolean;
}

export const ActiveSessionsCard: React.FC<ActiveSessionsCardProps> = ({
  sessions,
  onRevoke,
  onRevokeOthers,
  isLoading = false,
}) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await onRevoke(id);
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthers = async () => {
    setIsRevokingOthers(true);
    try {
      await onRevokeOthers();
    } finally {
      setIsRevokingOthers(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'mobile') return <Smartphone className="w-5 h-5 text-indigo-500" />;
    if (deviceType === 'tablet') return <Tablet className="w-5 h-5 text-cyan-500" />;
    return <Laptop className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Active Login Sessions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage devices currently signed into your HealthSphere account.
          </p>
        </div>

        {sessions.length > 1 && (
          <button
            onClick={handleRevokeOthers}
            disabled={isRevokingOthers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors"
          >
            {isRevokingOthers ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Revoke All Other Sessions
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading active sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">No active sessions found.</div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                  {getDeviceIcon(session.deviceType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {session.browser || 'Chrome'} on {session.os || 'Windows'}
                    </h4>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 rounded-full border border-emerald-300 dark:border-emerald-800">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {session.ipAddress}
                    </span>
                    <span>•</span>
                    <span>Active: {new Date(session.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  disabled={revokingId === session.id}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                >
                  {revokingId === session.id ? 'Revoking...' : 'Revoke'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
