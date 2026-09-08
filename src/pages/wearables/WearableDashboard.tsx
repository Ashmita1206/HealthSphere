import React from 'react';
import { Watch, Heart, Activity, Wifi } from 'lucide-react';
import { ConnectedDevicesStrip } from './components/ConnectedDevicesStrip';
import { LiveECGStrip } from './components/LiveECGStrip';
import { VitalsTelemetryGrid } from './components/VitalsTelemetryGrid';
import { HourlyActivityChart } from './components/HourlyActivityChart';
import { SyncStatusBanner } from './components/SyncStatusBanner';

export default function WearableDashboard() {
  return (
    <div data-testid="wearable-dashboard-page" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-700 text-white">
              <Watch className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Wearable Health Biosensor & Telemetry Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time optical PPG and electrode telemetry, Lead-I ECG strip, sleep architecture, and intraday exertion
          </p>
        </div>
      </div>

      {/* 1. Sync Status Banner */}
      <SyncStatusBanner />

      {/* 2. Connected Devices Strip */}
      <ConnectedDevicesStrip />

      {/* 3. Live Ambulatory ECG Rhythm Strip */}
      <LiveECGStrip />

      {/* 4. Vitals Telemetry Grid (Heart Rate, Steps, Sleep, SpO2) */}
      <VitalsTelemetryGrid />

      {/* 5. Intraday Hourly Activity Chart */}
      <HourlyActivityChart />
    </div>
  );
}
