import React, { useState } from 'react';
import { History, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface IncidentRecord {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  triggerReason: string;
  timestamp: string;
  duration: string;
  doctorName?: string;
  status: 'resolved' | 'escalated' | 'cancelled' | string;
  outcomeNote: string;
}

export interface IncidentHistoryTableProps {
  incidents?: IncidentRecord[];
  className?: string;
}

// Retained for test fixture typing only; never used as a component default
export const DEFAULT_INCIDENT_HISTORY: IncidentRecord[] = [];

export const IncidentHistoryTable: React.FC<IncidentHistoryTableProps> = ({
  incidents = [],
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = incidents.filter(
    (inc) =>
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.triggerReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.severity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300';
      case 'HIGH':
        return 'bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleExportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incidents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'HealthSphere_Emergency_Incidents_Log.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!incidents || incidents.length === 0) {
    return (
      <div
        data-testid="incident-history-empty"
        className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-2.5 ${className}`}
      >
        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            No Emergency Incidents on Record
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Verified records of manual SOS dispatches, paramedic routing, and automated triage classifications will be logged here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="incident-history-table"
      className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Emergency Incident History & Audit Log ({incidents.length})
            </h3>
            <p className="text-xs text-slate-500">
              Verified records of SOS dispatches and automated risk classifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-white"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportHistory}
            className="h-8 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export Log</span>
          </Button>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            data-testid={`incident-row-${inc.id}`}
            className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-500">{inc.id}</span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getSeverityBadge(
                    inc.severity
                  )}`}
                >
                  {inc.severity}
                </span>
                <span className="text-[11px] text-slate-400">• {inc.timestamp}</span>
                <span className="text-[11px] text-slate-400">• Triage Duration: {inc.duration}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{inc.triggerReason}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{inc.outcomeNote}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {inc.doctorName && (
                <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-1 rounded-lg">
                  {inc.doctorName}
                </span>
              )}
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg ${
                  inc.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : inc.status === 'cancelled'
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {inc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
