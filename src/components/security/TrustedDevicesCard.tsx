import React, { useState } from 'react';
import { Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { TrustedDevice } from '../../services/securityService';

interface TrustedDevicesCardProps {
  devices: TrustedDevice[];
  onUntrust: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const TrustedDevicesCard: React.FC<TrustedDevicesCardProps> = ({
  devices,
  onUntrust,
  isLoading = false,
}) => {
  const [untrustingId, setUntrustingId] = useState<string | null>(null);

  const handleUntrust = async (id: string) => {
    setUntrustingId(id);
    try {
      await onUntrust(id);
    } finally {
      setUntrustingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Trusted Hardware Devices
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          These verified devices can sign in without prompt for secondary SMS or email challenges.
        </p>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading verified devices...</div>
      ) : devices.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">No trusted devices registered.</div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">{device.deviceName}</h4>
                    {device.isTrusted ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Trusted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <XCircle className="w-3 h-3" /> Untrusted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Last active: {new Date(device.lastSeen).toLocaleDateString()} at {new Date(device.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleUntrust(device.id)}
                disabled={untrustingId === device.id}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                {untrustingId === device.id ? 'Removing...' : 'Untrust'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
