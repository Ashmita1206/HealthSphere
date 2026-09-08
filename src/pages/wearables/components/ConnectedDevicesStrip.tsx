import React from 'react';
import { Watch, BatteryCharging, Wifi, WifiOff, RefreshCw, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WearableDevice {
  id: string;
  name: string;
  brand: string;
  type: 'smartwatch' | 'ring' | 'cgm' | 'chest_strap';
  batteryLevel: number;
  status: 'connected' | 'syncing' | 'disconnected';
  lastSync: string;
}

export const DEFAULT_DEVICES: WearableDevice[] = [
  {
    id: 'dev-1',
    name: 'Apple Watch Ultra 2',
    brand: 'Apple',
    type: 'smartwatch',
    batteryLevel: 82,
    status: 'connected',
    lastSync: '1 min ago',
  },
  {
    id: 'dev-2',
    name: 'Oura Ring Horizon Gen 3',
    brand: 'Oura',
    type: 'ring',
    batteryLevel: 94,
    status: 'connected',
    lastSync: '4 mins ago',
  },
  {
    id: 'dev-3',
    name: 'Dexcom G7 Continuous Glucose',
    brand: 'Dexcom',
    type: 'cgm',
    batteryLevel: 68,
    status: 'connected',
    lastSync: 'Just now',
  },
];

export const ConnectedDevicesStrip: React.FC<{
  devices?: WearableDevice[];
  onSyncDevice?: (id: string) => void;
  onPairNew?: () => void;
  className?: string;
}> = ({ devices = DEFAULT_DEVICES, onSyncDevice, onPairNew, className = '' }) => {
  return (
    <div
      data-testid="connected-devices-strip"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Connected Wearable Biosensors ({devices.length})
          </h3>
          <p className="text-xs text-slate-500">
            Real-time biometric ingest via Bluetooth Low Energy (BLE) and HealthKit / Google Health Connect
          </p>
        </div>

        <Button
          size="sm"
          onClick={onPairNew}
          className="h-8 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Pair New Sensor</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {devices.map((d) => (
          <div
            key={d.id}
            data-testid={`device-card-${d.id}`}
            className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-300">
                  <Watch className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {d.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {d.brand}
                  </span>
                </div>
              </div>

              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <Wifi className="w-3 h-3" /> Live
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{d.batteryLevel}%</span>
              </span>

              <span className="text-[11px] text-slate-400">
                Synced {d.lastSync}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
