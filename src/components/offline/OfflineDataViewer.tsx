import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Pill,
  Calendar,
  Clock,
  Database,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface OfflineDataViewerProps {
  reports: any[];
  medicines: any[];
  appointments: any[];
  timeline: any[];
  isLoading?: boolean;
}

export const OfflineDataViewer: React.FC<OfflineDataViewerProps> = ({
  reports,
  medicines,
  appointments,
  timeline,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'medicines' | 'appointments' | 'timeline'>('reports');
  const [search, setSearch] = useState('');

  const filterItems = (list: any[]) => {
    if (!search.trim()) return list;
    const s = search.toLowerCase();
    return list.filter((item) => {
      const text = JSON.stringify(item).toLowerCase();
      return text.includes(s);
    });
  };

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm backdrop-blur-md space-y-5">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/30">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Offline Cached Medical Records
          </h3>
          <p className="text-xs text-muted-foreground">
            Synchronized directly from IndexedDB local storage
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/30 text-xs">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'medicines'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            Medicines ({medicines.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'appointments'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timeline ({timeline.length})
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search cached ${activeTab}...`}
          className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border/40 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Tab Panels */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {activeTab === 'reports' && (
          filterItems(reports).length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No reports cached in offline storage.</div>
          ) : (
            filterItems(reports).map((r, i) => (
              <div key={r.id || r._id || i} className="p-3 rounded-xl border border-border/30 bg-muted/20 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{r.title || r.fileName || 'Diagnostic Report'}</h4>
                  <p className="text-[11px] text-muted-foreground">{r.category || 'Clinical Labs'} • {r.summary || 'Summary cached'}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium border border-primary/20">
                  Cached
                </span>
              </div>
            ))
          )
        )}

        {activeTab === 'medicines' && (
          filterItems(medicines).length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No medicines cached in offline storage.</div>
          ) : (
            filterItems(medicines).map((m, i) => (
              <div key={m.id || m._id || i} className="p-3 rounded-xl border border-border/30 bg-muted/20 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{m.name || m.medicineName}</h4>
                  <p className="text-[11px] text-muted-foreground">{m.dosage} • {m.frequency} • {m.instructions || 'With water'}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                  Active
                </span>
              </div>
            ))
          )
        )}

        {activeTab === 'appointments' && (
          filterItems(appointments).length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No appointments cached in offline storage.</div>
          ) : (
            filterItems(appointments).map((a, i) => (
              <div key={a.id || a._id || i} className="p-3 rounded-xl border border-border/30 bg-muted/20 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{a.doctorName || 'Specialist Consultation'}</h4>
                  <p className="text-[11px] text-muted-foreground">{a.date ? new Date(a.date).toLocaleDateString() : 'Upcoming'} • {a.type || 'Telemedicine'}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20 capitalize">
                  {a.status || 'Confirmed'}
                </span>
              </div>
            ))
          )
        )}

        {activeTab === 'timeline' && (
          filterItems(timeline).length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No timeline events cached in offline storage.</div>
          ) : (
            filterItems(timeline).map((t, i) => (
              <div key={t.id || t._id || i} className="p-3 rounded-xl border border-border/30 bg-muted/20 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{t.title || 'Health Event'}</h4>
                  <p className="text-[11px] text-muted-foreground">{t.description || t.eventType} • {t.date ? new Date(t.date).toLocaleDateString() : ''}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium border border-purple-500/20 capitalize">
                  {t.eventType || 'Event'}
                </span>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
