import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SyncStatusBanner } from '@/pages/wearables/components/SyncStatusBanner';
import { ConnectedDevicesStrip, DEFAULT_DEVICES } from '@/pages/wearables/components/ConnectedDevicesStrip';
import { LiveECGStrip, DEFAULT_ECG } from '@/pages/wearables/components/LiveECGStrip';
import { VitalsTelemetryGrid, DEFAULT_VITALS_TELEMETRY } from '@/pages/wearables/components/VitalsTelemetryGrid';
import { HourlyActivityChart, DEFAULT_HOURLY_DATA } from '@/pages/wearables/components/HourlyActivityChart';
import WearableDashboard from '@/pages/wearables/WearableDashboard';

// Mock ResizeObserver for Recharts ResponsiveContainer
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('F32 — Wearable Dashboard UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SyncStatusBanner and handles manual sync action', async () => {
    const handleSync = vi.fn();
    render(<SyncStatusBanner lastSyncTime="2m ago" onManualSync={handleSync} />);

    expect(screen.getByTestId('sync-status-banner')).toBeInTheDocument();
    expect(screen.getByText(/Continuous Cloud Telemetry Sync/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-Sync Active/i)).toBeInTheDocument();

    const syncBtn = screen.getByRole('button', { name: /Sync Now/i });
    fireEvent.click(syncBtn);
    expect(handleSync).toHaveBeenCalled();
  });

  it('renders ConnectedDevicesStrip with paired sensors and battery levels', () => {
    render(<ConnectedDevicesStrip devices={DEFAULT_DEVICES} />);
    expect(screen.getByTestId('connected-devices-strip')).toBeInTheDocument();
    expect(screen.getByText('Apple Watch Ultra 2')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('Oura Ring Horizon Gen 3')).toBeInTheDocument();
    expect(screen.getByText('Dexcom G7 Continuous Glucose')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pair New Sensor/i })).toBeInTheDocument();
  });

  it('renders LiveECGStrip with rhythm analysis and intervals', () => {
    render(<LiveECGStrip metrics={DEFAULT_ECG} />);
    expect(screen.getByTestId('live-ecg-strip')).toBeInTheDocument();
    expect(screen.getByText(/Live Lead-I Ambulatory ECG Rhythm Strip/i)).toBeInTheDocument();
    expect(screen.getByText(/Normal Sinus Rhythm \(NSR\)/i)).toBeInTheDocument();
    expect(screen.getByText('154 ms')).toBeInTheDocument();
    expect(screen.getByText('88 ms')).toBeInTheDocument();
    expect(screen.getByText('412 ms')).toBeInTheDocument();
  });

  it('renders VitalsTelemetryGrid with continuous biometric parameters', () => {
    render(<VitalsTelemetryGrid data={DEFAULT_VITALS_TELEMETRY} />);
    expect(screen.getByTestId('vitals-telemetry-grid')).toBeInTheDocument();
    expect(screen.getByTestId('card-heart-rate')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByTestId('card-steps')).toBeInTheDocument();
    expect(screen.getByText('8,740')).toBeInTheDocument();
    expect(screen.getByTestId('card-sleep')).toBeInTheDocument();
    expect(screen.getByText('7h 42m')).toBeInTheDocument();
    expect(screen.getByTestId('card-spo2')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
  });

  it('renders HourlyActivityChart with step and exertion distributions', () => {
    render(<HourlyActivityChart data={DEFAULT_HOURLY_DATA} />);
    expect(screen.getByTestId('hourly-activity-chart')).toBeInTheDocument();
    expect(screen.getByText(/Intraday Hourly Activity & Exertion Load/i)).toBeInTheDocument();
  });

  it('renders WearableDashboard master page layout', () => {
    render(<WearableDashboard />);
    expect(screen.getByTestId('wearable-dashboard-page')).toBeInTheDocument();
    expect(
      screen.getByText(/Wearable Health Biosensor & Telemetry Hub/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('sync-status-banner')).toBeInTheDocument();
    expect(screen.getByTestId('connected-devices-strip')).toBeInTheDocument();
    expect(screen.getByTestId('live-ecg-strip')).toBeInTheDocument();
    expect(screen.getByTestId('vitals-telemetry-grid')).toBeInTheDocument();
    expect(screen.getByTestId('hourly-activity-chart')).toBeInTheDocument();
  });
});
