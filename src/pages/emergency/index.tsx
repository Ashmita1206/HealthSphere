import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmergencyModal } from '@/components/emergency/EmergencyModal';
import {
  Phone,
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  Users,
  Heart,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  Droplet,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface IncidentItem {
  id: string;
  severity: string;
  triggerReason: string;
  timestamp: string;
  status: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

export default function EmergencyPage() {
  const { user } = useAuth();
  const { location: geoLocation, requestLocation } = useGeolocation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultView, setModalDefaultView] = useState<
    'main' | 'sos_confirm' | 'contacts' | 'medical_id' | 'hospitals' | 'location' | 'history'
  >('main');

  const [contactsCount, setContactsCount] = useState<number>(0);
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [activeIncidents, setActiveIncidents] = useState<IncidentItem[]>([]);
  const [historyIncidents, setHistoryIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Request location on mount
  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  const openModalWithView = (
    view: 'main' | 'sos_confirm' | 'contacts' | 'medical_id' | 'hospitals' | 'location' | 'history'
  ) => {
    setModalDefaultView(view);
    setModalOpen(true);
  };

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [contactsRes, profileRes, activeRes, historyRes] = await Promise.allSettled([
        api.get<any[]>('/emergency/contacts'),
        api.get<any>('/user/profile'),
        api.get<any>('/emergency/active'),
        api.get<any>('/emergency/history'),
      ]);

      if (contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value)) {
        setContactsCount(contactsRes.value.length);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setBloodGroup(profileRes.value.blood_type || profileRes.value.bloodGroup || '');
      }

      if (activeRes.status === 'fulfilled') {
        const raw = activeRes.value;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        setActiveIncidents(
          list.map((inc: any) => ({
            id: inc._id || inc.id,
            severity: inc.severity || 'CRITICAL',
            triggerReason: inc.triggerReason || inc.description || 'Emergency SOS',
            timestamp: inc.createdAt ? new Date(inc.createdAt).toLocaleString() : 'Just now',
            status: inc.status || 'active',
            location: inc.location,
          }))
        );
      }

      if (historyRes.status === 'fulfilled') {
        const raw = historyRes.value;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        setHistoryIncidents(
          list.map((inc: any) => ({
            id: inc._id || inc.id,
            severity: inc.severity || 'HIGH',
            triggerReason: inc.triggerReason || inc.description || 'Emergency SOS',
            timestamp: inc.createdAt ? new Date(inc.createdAt).toLocaleString() : 'Recent',
            status: inc.status || 'resolved',
            location: inc.location,
          }))
        );
      }
    } catch {
      // retain state
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCallEmergencyServices = () => {
    window.open('tel:112', '_self');
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <PageHeader
            title="Emergency SOS"
            description="Rapid-response emergency actions, medical identity, and verified healthcare services."
            breadcrumbs={[{ label: 'Emergency' }]}
            badge="Emergency 24/7"
          />
        </div>

        <div className="shrink-0">
          <Button
            type="button"
            onClick={() => openModalWithView('main')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Open Emergency Dialog</span>
          </Button>
        </div>
      </div>

      {/* Active Alerts Banner if any real active incidents exist */}
      {activeIncidents.length > 0 && (
        <div className="space-y-2">
          {activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-rose-600 text-white text-[10px] font-black uppercase">
                      ACTIVE {incident.severity} ALERT
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">
                      {incident.timestamp}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {incident.triggerReason}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  try {
                    await api.put(`/emergency/${incident.id}/resolve`, { status: 'resolved' });
                    await loadData();
                  } catch (err: any) {
                    alert(err?.message || 'Could not resolve incident');
                  }
                }}
                className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold"
              >
                Resolve Incident
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* PRIMARY EMERGENCY ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Action A: Call 112 */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-rose-50/50 border border-rose-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-200 text-rose-950">
                Action A • Direct Dialer
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-3 font-heading">
              Call Emergency Services
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Instantly connect to national emergency dispatch (112) using your phone's native telecommunications dialer.
            </p>
          </div>

          <div>
            <Button
              type="button"
              onClick={handleCallEmergencyServices}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-sm h-12 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call 112</span>
            </Button>
            <p className="text-[10px] text-slate-500 text-center mt-2 leading-tight">
              Opens native phone dialer. HealthSphere does not claim or verify call completion.
            </p>
          </div>
        </div>

        {/* Action B: Send SOS Alert */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border border-amber-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-200 text-amber-950">
                Action B • Confirmed Signal
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-3 font-heading">
              Send Emergency SOS Alert
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Broadcasts an urgent incident record with your coordinates to your saved emergency contacts.
            </p>
          </div>

          <div>
            <Button
              type="button"
              onClick={() => openModalWithView('sos_confirm')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-sm h-12 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Open SOS Alert Confirmation</span>
            </Button>
            <p className="text-[10px] text-slate-500 text-center mt-2 leading-tight">
              Confirmation required before dispatching. Prevents accidental or duplicate submissions.
            </p>
          </div>
        </div>
      </div>

      {/* SECONDARY QUICK ACTIONS (4 COMPACT CARDS) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
          Quick Access Emergency Resources
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Emergency Contacts */}
          <div
            onClick={() => openModalWithView('contacts')}
            className="p-4 rounded-2xl bg-white hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 border-teal-200 text-teal-800 bg-teal-50">
                {contactsCount} Saved
              </Badge>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-900">
                Emergency Contacts
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage, add, and dial contacts.
              </p>
            </div>
          </div>

          {/* 2. Medical ID */}
          <div
            onClick={() => openModalWithView('medical_id')}
            className="p-4 rounded-2xl bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              {bloodGroup && (
                <Badge className="text-xs font-black bg-rose-600 text-white px-2 py-0.5">
                  {bloodGroup}
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-900">
                Emergency Medical ID
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Allergies, conditions, and history.
              </p>
            </div>
          </div>

          {/* 3. Nearby Hospitals */}
          <div
            onClick={() => openModalWithView('hospitals')}
            className="p-4 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 border-blue-200 text-blue-800 bg-blue-50">
                OpenStreetMap
              </Badge>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-900">
                Nearby Hospitals
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Locate verified ER emergency rooms.
              </p>
            </div>
          </div>

          {/* 4. Share Location */}
          <div
            onClick={() => openModalWithView('location')}
            className="p-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 border-emerald-200 text-emerald-800 bg-emerald-50">
                {geoLocation ? 'Active GPS' : 'Standby'}
              </Badge>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-900">
                Share Location
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Broadcast live coordinates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BLOOD & ORGAN REQUISITION NAVIGATION BANNER (Clean Link to Existing Route) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-teal-50 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 font-heading">
              Blood & Organ Donation Module
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
              Looking for blood inventory, organ registry, or donor coordination? Visit the dedicated Blood & Organ portal.
            </p>
          </div>
        </div>

        <Link
          to="/blood-donation"
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold shadow-sm transition-all"
        >
          <span>Visit Blood & Organ</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* EMERGENCY HISTORY & AUDIT LOG CARD */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Emergency Incident Audit Log ({historyIncidents.length + activeIncidents.length})
              </h4>
              <p className="text-xs text-slate-500">
                Verified persisted records of manual SOS broadcasts and triage events.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openModalWithView('history')}
            className="text-xs font-bold rounded-xl"
          >
            View Full Log
          </Button>
        </div>

        {historyIncidents.length === 0 && activeIncidents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No emergency incidents recorded in your audit history.
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            {[...activeIncidents, ...historyIncidents].slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={item.status === 'active' ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"}>
                      {item.status.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-slate-800">{item.triggerReason}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.timestamp}</p>
                </div>
                <Badge variant="outline" className="text-[10px] text-slate-500 font-mono">
                  {item.location?.latitude ? 'GPS Shared' : 'No GPS'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Modal Instance */}
      <EmergencyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultView={modalDefaultView}
      />
    </div>
  );
}
