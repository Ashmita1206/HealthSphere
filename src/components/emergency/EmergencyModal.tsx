import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/services/api';
import { getNearbyHospitals, type Location } from '@/services/locationsService';
import {
  Phone,
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  Users,
  FileText,
  Building2,
  MapPin,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  X,
  Droplet,
  Heart,
  ChevronRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

export interface EmergencyContactItem {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary?: boolean;
}

export interface IncidentHistoryItem {
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
  duration?: string;
  outcomeNote?: string;
}

export interface MedicalProfileSummary {
  fullName: string;
  bloodGroup: string;
  age?: number;
  dateOfBirth?: string;
  allergies: string[];
  chronicDiseases: string[];
  surgeries: string[];
  emergencyContact?: string;
  emergencyContactPhone?: string;
  healthId?: string;
  lastUpdated?: string;
}

export interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'main' | 'sos_confirm' | 'contacts' | 'medical_id' | 'hospitals' | 'location' | 'history';
}

type ModalView =
  | 'main'
  | 'sos_confirm'
  | 'sos_result'
  | 'contacts'
  | 'medical_id'
  | 'hospitals'
  | 'location'
  | 'history';

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  open,
  onOpenChange,
  defaultView = 'main',
}) => {
  const { user } = useAuth();
  const { location: geoLocation, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  // Navigation within the modal
  const [currentView, setCurrentView] = useState<ModalView>(defaultView);

  // Emergency Contacts state
  const [contacts, setContacts] = useState<EmergencyContactItem[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  // Contact form state
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);
  const [contactFormError, setContactFormError] = useState<string | null>(null);

  // Medical Profile state
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfileSummary | null>(null);
  const [medicalProfileLoading, setMedicalProfileLoading] = useState(false);

  // Nearby Hospitals state
  const [hospitals, setHospitals] = useState<Location[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);

  // Emergency History state
  const [historyItems, setHistoryItems] = useState<IncidentHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // SOS Submission state
  const [isTestMode, setIsTestMode] = useState(false);
  const [isSubmittingSOS, setIsSubmittingSOS] = useState(false);
  const [sosResult, setSosResult] = useState<{
    success: boolean;
    status: string;
    incidentId?: string;
    locationShared: boolean;
    latitude?: number;
    longitude?: number;
    timestamp: string;
    message?: string;
    errorMessage?: string;
    isTwilioConfigured?: boolean;
    isStatusCallbackConfigured?: boolean;
    isTestMode?: boolean;
    dispatchRecords?: Array<{
      contactId?: string;
      contactName?: string;
      phone?: string;
      channel?: string;
      status: string;
      messageSid?: string | null;
      errorCode?: string | null;
      errorMessage?: string | null;
      updatedAt?: string | Date;
    }>;
  } | null>(null);

  // Copy feedback
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedDialer, setCopiedDialer] = useState(false);

  // Sync default view on modal open
  useEffect(() => {
    if (open) {
      setCurrentView(defaultView);
      setSosResult(null);
      void loadContacts();
      void loadMedicalProfile();
      if (!geoLocation) {
        void requestLocation();
      }
    }
  }, [open, defaultView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch Contacts
  const loadContacts = useCallback(async () => {
    if (!user) return;
    setContactsLoading(true);
    try {
      const res = await api.get<any[]>('/emergency/contacts');
      if (Array.isArray(res)) {
        const formatted: EmergencyContactItem[] = res.map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          phone: c.phone,
          relation: c.relation || 'Emergency Contact',
          isPrimary: (c.relation || '').toLowerCase().includes('primary'),
        }));
        setContacts(formatted);
        // Default select all contacts for SOS
        setSelectedContactIds(new Set(formatted.map((c) => c.id)));
      }
    } catch {
      // keep current contacts on error
    } finally {
      setContactsLoading(false);
    }
  }, [user]);

  // Fetch Medical Profile
  const loadMedicalProfile = useCallback(async () => {
    if (!user) return;
    setMedicalProfileLoading(true);
    try {
      const res = await api.get<any>('/user/profile');
      if (res) {
        let age: number | undefined;
        if (res.date_of_birth) {
          const birthDate = new Date(res.date_of_birth);
          if (!Number.isNaN(birthDate.getTime())) {
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
        }

        setMedicalProfile({
          fullName: res.full_name || user.name || 'Not provided',
          bloodGroup: res.blood_type || res.bloodGroup || '',
          age: age && age >= 0 ? age : undefined,
          dateOfBirth: res.date_of_birth || undefined,
          allergies: Array.isArray(res.allergies) ? res.allergies : [],
          chronicDiseases: Array.isArray(res.chronic_diseases) ? res.chronic_diseases : [],
          surgeries: Array.isArray(res.surgeries) ? res.surgeries : [],
          emergencyContact: res.emergency_contact_name || undefined,
          emergencyContactPhone: res.emergency_contact_phone || undefined,
          healthId: user.id || undefined,
          lastUpdated: res.updatedAt ? new Date(res.updatedAt).toLocaleDateString() : undefined,
        });
      }
    } catch {
      // fallback
    } finally {
      setMedicalProfileLoading(false);
    }
  }, [user]);

  const geoLat = geoLocation?.latitude;
  const geoLng = geoLocation?.longitude;

  // Fetch Nearby Hospitals
  const loadHospitals = useCallback(async () => {
    if (geoLat == null || geoLng == null) return;
    setHospitalsLoading(true);
    setHospitalsError(null);
    try {
      const res = await getNearbyHospitals(geoLat, geoLng, 5000);
      if (res.error) {
        setHospitalsError(res.error);
        setHospitals([]);
      } else {
        const sorted = [...res.locations].sort(
          (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
        );
        setHospitals(sorted);
      }
    } catch (err: any) {
      setHospitalsError(err?.message || 'Failed to query nearby healthcare facilities');
      setHospitals([]);
    } finally {
      setHospitalsLoading(false);
    }
  }, [geoLat, geoLng]);

  // Load hospitals when switching to hospitals view
  const prevViewRef = useRef<ModalView>('main');
  useEffect(() => {
    if (currentView === 'hospitals' && prevViewRef.current !== 'hospitals') {
      if (geoLat != null && geoLng != null) {
        void loadHospitals();
      } else {
        void requestLocation();
      }
    }
    prevViewRef.current = currentView;
  }, [currentView, geoLat, geoLng, loadHospitals, requestLocation]);

  // Fetch Emergency History
  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const [historyRes, activeRes] = await Promise.allSettled([
        api.get<any>('/emergency/history'),
        api.get<any>('/emergency/active'),
      ]);

      const items: IncidentHistoryItem[] = [];

      if (activeRes.status === 'fulfilled') {
        const raw = activeRes.value;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        list.forEach((inc: any) => {
          items.push({
            id: inc._id || inc.id,
            severity: inc.severity || 'CRITICAL',
            triggerReason: inc.triggerReason || inc.description || 'Emergency SOS',
            timestamp: inc.createdAt ? new Date(inc.createdAt).toLocaleString() : 'Just now',
            status: inc.status || 'active',
            location: inc.location,
          });
        });
      }

      if (historyRes.status === 'fulfilled') {
        const raw = historyRes.value;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        list.forEach((inc: any) => {
          // Avoid duplicate with active
          if (!items.some((i) => i.id === (inc._id || inc.id))) {
            items.push({
              id: inc._id || inc.id,
              severity: inc.severity || 'HIGH',
              triggerReason: inc.triggerReason || inc.description || 'Emergency SOS',
              timestamp: inc.createdAt ? new Date(inc.createdAt).toLocaleString() : 'Recent',
              status: inc.status || 'resolved',
              location: inc.location,
              duration: inc.duration,
              outcomeNote: inc.outcomeNote,
            });
          }
        });
      }

      setHistoryItems(items);
    } catch {
      // retain state
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  // Load history when switching to history view
  const prevHistoryViewRef = useRef<ModalView>('main');
  useEffect(() => {
    if (currentView === 'history' && prevHistoryViewRef.current !== 'history') {
      void loadHistory();
    }
    prevHistoryViewRef.current = currentView;
  }, [currentView, loadHistory]);

  // Handle Call 112
  const handleCallEmergencyServices = () => {
    window.open('tel:112', '_self');
  };

  // Handle Contact Toggle in SOS Confirmation
  const toggleContactSelection = (id: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Submit SOS Alert
  const handleConfirmSOS = async () => {
    if (isSubmittingSOS) return;
    setIsSubmittingSOS(true);

    const hasValidCoords =
      geoLocation &&
      typeof geoLocation.latitude === 'number' &&
      typeof geoLocation.longitude === 'number' &&
      !Number.isNaN(geoLocation.latitude) &&
      !Number.isNaN(geoLocation.longitude);

    const payload: {
      latitude?: number;
      longitude?: number;
      contactIds?: string[];
      isTestMode?: boolean;
    } = {
      isTestMode: Boolean(isTestMode),
    };
    if (hasValidCoords) {
      payload.latitude = geoLocation.latitude;
      payload.longitude = geoLocation.longitude;
    }
    if (selectedContactIds.size > 0) {
      payload.contactIds = Array.from(selectedContactIds);
    }

    try {
      const res = await api.post<{
        success?: boolean;
        status?: string;
        incidentId?: string;
        isTwilioConfigured?: boolean;
        isStatusCallbackConfigured?: boolean;
        isTestMode?: boolean;
        dispatchRecords?: any[];
        data?: any;
        message?: string;
      }>('/emergency/sos', payload);

      const isConfirmed = Boolean(
        res &&
          (res.status === 'triggered' ||
            res.success === true ||
            (res.data && (res.data.id || res.data._id || res.data.incidentId || res.data.status === 'active')))
      );

      if (!isConfirmed) {
        throw new Error('Server did not return a confirmed emergency dispatch status.');
      }

      const verifiedId = res.incidentId || res.data?.id || res.data?._id || res.data?.incidentId || 'SOS-' + Date.now();

      setSosResult({
        success: true,
        status: isTestMode ? 'Test Alert Broadcast' : 'Created / In-App Dispatched',
        incidentId: verifiedId,
        locationShared: Boolean(hasValidCoords),
        latitude: hasValidCoords ? geoLocation.latitude : undefined,
        longitude: hasValidCoords ? geoLocation.longitude : undefined,
        timestamp: new Date().toLocaleTimeString(),
        message:
          res.message ||
          (isTestMode
            ? 'Test emergency alert verified. Real SMS marked with [TEST ALERT] sent to authorized contacts.'
            : 'Emergency alert recorded and in-app notifications generated.'),
        isTwilioConfigured: res.isTwilioConfigured ?? res.data?.isTwilioConfigured,
        isStatusCallbackConfigured: res.isStatusCallbackConfigured ?? res.data?.isStatusCallbackConfigured,
        isTestMode: res.isTestMode ?? res.data?.isTestMode ?? isTestMode,
        dispatchRecords: res.dispatchRecords ?? res.data?.dispatchRecords ?? [],
      });
      setCurrentView('sos_result');
    } catch (err: any) {
      const isThrottled = err?.response?.status === 429 || err?.status === 429;
      const errorMsg = isThrottled
        ? 'Duplicate Alert Protection: An emergency alert was already triggered in the last 10 seconds. Please wait before broadcasting another alert to prevent duplicate messages.'
        : err?.response?.data?.message ||
          err?.message ||
          'Failed to transmit emergency signal to server. Please dial 112 or call emergency contacts directly.';

      setSosResult({
        success: false,
        status: isThrottled ? 'Throttled (Anti-Duplicate)' : 'Failed / Unconfirmed',
        locationShared: Boolean(hasValidCoords),
        timestamp: new Date().toLocaleTimeString(),
        errorMessage: errorMsg,
      });
      setCurrentView('sos_result');
    } finally {
      setIsSubmittingSOS(false);
    }
  };

  // Live polling for Twilio delivery updates if any message is queued or sent
  useEffect(() => {
    if (
      currentView !== 'sos_result' ||
      !sosResult?.incidentId ||
      !sosResult?.isTwilioConfigured ||
      !sosResult?.dispatchRecords?.some((r) => r.status === 'queued' || r.status === 'sent')
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await api.get<any>(`/emergency/sos/${sosResult.incidentId}/status`);
        if (res && Array.isArray(res.dispatchRecords)) {
          setSosResult((prev) => (prev ? { ...prev, dispatchRecords: res.dispatchRecords } : null));
        }
      } catch {
        // ignore polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentView, sosResult?.incidentId, sosResult?.isTwilioConfigured]);

  // Handle Contact CRUD
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormError(null);

    const trimmedName = contactName.trim();
    const trimmedPhone = contactPhone.trim();
    if (!trimmedName) {
      setContactFormError('Contact name is required.');
      return;
    }
    if (!trimmedPhone || trimmedPhone.length < 5) {
      setContactFormError('A valid phone number is required.');
      return;
    }

    try {
      const relationValue = contactIsPrimary
        ? `${contactRelation.trim() || 'Emergency Contact'} (Primary)`
        : contactRelation.trim() || 'Emergency Contact';

      if (editingContactId) {
        await api.put(`/emergency/contacts/${editingContactId}`, {
          name: trimmedName,
          phone: trimmedPhone,
          relation: relationValue,
        });
      } else {
        await api.post('/emergency/contacts', {
          name: trimmedName,
          phone: trimmedPhone,
          relation: relationValue,
        });
      }

      // Reset form
      setContactName('');
      setContactPhone('');
      setContactRelation('');
      setContactIsPrimary(false);
      setIsAddingContact(false);
      setEditingContactId(null);
      await loadContacts();
    } catch (err: any) {
      setContactFormError(err?.message || 'Failed to save emergency contact.');
    }
  };

  const handleEditContact = (c: EmergencyContactItem) => {
    setEditingContactId(c.id);
    setContactName(c.name);
    setContactPhone(c.phone);
    const cleanRelation = c.relation.replace(/\s*\(Primary\)/i, '').trim();
    setContactRelation(cleanRelation);
    setContactIsPrimary(c.isPrimary || c.relation.toLowerCase().includes('primary'));
    setIsAddingContact(true);
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await api.delete(`/emergency/contacts/${id}`);
      await loadContacts();
    } catch (err: any) {
      alert(err?.message || 'Could not delete emergency contact.');
    }
  };

  const handleTogglePrimary = async (c: EmergencyContactItem) => {
    const isNowPrimary = !c.isPrimary;
    const baseRelation = c.relation.replace(/\s*\(Primary\)/i, '').trim();
    const updatedRelation = isNowPrimary
      ? `${baseRelation || 'Emergency Contact'} (Primary)`
      : baseRelation || 'Emergency Contact';

    try {
      await api.put(`/emergency/contacts/${c.id}`, {
        name: c.name,
        phone: c.phone,
        relation: updatedRelation,
      });
      await loadContacts();
    } catch {
      // revert silently
    }
  };

  // Copy coordinates to clipboard
  const handleCopyLocation = () => {
    if (!geoLocation) return;
    const text = `${geoLocation.latitude.toFixed(5)}, ${geoLocation.longitude.toFixed(5)}`;
    void navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const formatDistance = (meters?: number) => {
    if (meters == null) return 'N/A';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-2xl z-50 text-slate-900"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Emergency Assistance</DialogTitle>
          <DialogDescription>
            Quick access to emergency help and your medical information.
          </DialogDescription>
        </DialogHeader>

        {/* ================= MODAL HEADER ================= */}
        <div className="bg-white border-b border-slate-200/80 text-slate-900 px-5 py-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentView !== 'main' ? (
              <button
                type="button"
                onClick={() => {
                  setContactFormError(null);
                  setIsAddingContact(false);
                  setEditingContactId(null);
                  setCurrentView('main');
                }}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center transition-colors text-slate-700 cursor-pointer"
                aria-label="Back to Emergency Overview"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-teal-700" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Emergency Assistance
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-teal-800 border border-slate-200 uppercase tracking-wider">
                  24/7
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Quick access to emergency help and your medical information.
              </p>
            </div>
          </div>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* ================= VIEW: MAIN ================= */}
          {currentView === 'main' && (
            <div className="space-y-4">
              {/* PRIMARY ACTION A & B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ACTION A: Call 112 */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                        Immediate Call
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        Call Emergency
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Direct connection to national emergency dispatch (112).
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 flex items-center justify-center shrink-0 shadow-xs">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="button"
                      onClick={handleCallEmergencyServices}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                      aria-label="Call 112 Emergency Services"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call 112</span>
                    </Button>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Opens native device dialer</span>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText('112');
                          setCopiedDialer(true);
                          setTimeout(() => setCopiedDialer(false), 2000);
                        }}
                        className="text-teal-700 hover:underline font-semibold"
                      >
                        {copiedDialer ? 'Copied 112!' : 'Desktop? Copy 112'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ACTION B: Send SOS Alert */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100">
                        Broadcast Signal
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        Send SOS Alert
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Transmit your live location to saved emergency contacts.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0 shadow-xs">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <Button
                      type="button"
                      onClick={() => setCurrentView('sos_confirm')}
                      className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs h-10 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                      aria-label="Open SOS Confirmation view"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-300" />
                      <span>Send SOS Alert</span>
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
                      Requires confirmation before dispatching. No alert is sent automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECONDARY QUICK ACTIONS (4 COMPACT ACTIONS) */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-0.5">
                  Emergency Resources & Information
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* 1. Emergency Contacts */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('contacts')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 transition-all text-left flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                        <span>Contacts</span>
                        <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 h-4 border-slate-300">
                          {contacts.length}
                        </Badge>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Manage & dial contacts
                      </p>
                    </div>
                  </button>

                  {/* 2. Medical ID */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('medical_id')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50/60 border border-slate-200 hover:border-rose-300 transition-all text-left flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Heart className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                        <span>Medical ID</span>
                        {medicalProfile?.bloodGroup && (
                          <Badge className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0 h-4 border-rose-200">
                            {medicalProfile.bloodGroup}
                          </Badge>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Allergies & blood group
                      </p>
                    </div>
                  </button>

                  {/* 3. Nearby Hospitals */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('hospitals')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all text-left flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Building2 className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Nearby Hospitals
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Verified ER facilities
                      </p>
                    </div>
                  </button>

                  {/* 4. Share Location */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('location')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all text-left flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Share Location
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {geoLocation ? 'GPS active' : 'Request GPS'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* EMERGENCY AUDIT LOG & TRANSPARENCY NOTICE */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('history')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Emergency Incident History (Audit Log)</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-snug">
                    <strong className="text-slate-700">Safety Disclosure:</strong> HealthSphere records emergency signals, creates audit logs, and notifies in-app triage. Automated cellular 911 dispatch or external SMS alerts require dialing emergency services directly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW: SOS CONFIRMATION ================= */}
          {currentView === 'sos_confirm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-950">
                      Confirm Emergency SOS Alert
                    </h4>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      Are you sure you want to trigger an SOS alert? This creates an urgent incident record and transmits your alert to the selected contacts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contacts To Notify */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contacts to Notify ({selectedContactIds.size} of {contacts.length})
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedContactIds.size === contacts.length) {
                        setSelectedContactIds(new Set());
                      } else {
                        setSelectedContactIds(new Set(contacts.map((c) => c.id)));
                      }
                    }}
                    className="text-[11px] font-bold text-teal-700 hover:underline"
                  >
                    {selectedContactIds.size === contacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {contacts.length === 0 ? (
                  <div className="p-3.5 rounded-xl border border-dashed border-slate-300 text-center space-y-1.5">
                    <p className="text-xs text-slate-500">No emergency contacts saved yet.</p>
                    <button
                      type="button"
                      onClick={() => setCurrentView('contacts')}
                      className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Emergency Contact
                    </button>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {contacts.map((c) => {
                      const isSelected = selectedContactIds.has(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleContactSelection(c.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? 'bg-amber-600 border-amber-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-tight">
                                {c.name}
                                {c.isPrimary && (
                                  <span className="ml-1.5 text-[9px] font-black uppercase px-1 py-0.2 rounded bg-rose-100 text-rose-800">
                                    Primary
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500">{c.phone} • {c.relation}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {isSelected ? 'Alerted' : 'Skipped'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Location Sharing Status */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Location Sharing</span>
                  </span>
                  {geoLocation ? (
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] border-emerald-200">
                      Live Coordinates Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-rose-700 bg-rose-50 text-[10px] border-rose-200">
                      GPS Unavailable
                    </Badge>
                  )}
                </div>

                {geoLocation ? (
                  <p className="text-[11px] text-slate-600 font-mono">
                    Lat: {geoLocation.latitude.toFixed(5)}, Lng: {geoLocation.longitude.toFixed(5)} (±{Math.round(geoLocation.accuracy)}m)
                  </p>
                ) : (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-rose-600">
                      Coordinates unavailable. Alert will transmit without location.
                    </p>
                    <button
                      type="button"
                      onClick={() => void requestLocation()}
                      disabled={geoLoading}
                      className="text-[11px] font-bold text-teal-700 hover:underline shrink-0"
                    >
                      {geoLoading ? 'Detecting...' : 'Enable Location'}
                    </button>
                  </div>
                )}
              </div>

              {/* Authorized Test Alert Toggle */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="test-mode-toggle" className="text-xs font-bold text-amber-950 cursor-pointer">
                      Authorized Test Alert Mode
                    </Label>
                    <Badge variant="outline" className={isTestMode ? "bg-amber-200/80 text-amber-900 border-amber-400 text-[10px] font-extrabold" : "bg-slate-100 text-slate-600 text-[10px]"}>
                      {isTestMode ? "ACTIVE (TEST)" : "LIVE SOS"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-tight">
                    Dispatches a real Twilio SMS labeled <span className="font-mono font-bold">[TEST ALERT]</span> to authorized contacts without sounding emergency alarms.
                  </p>
                </div>
                <input
                  id="test-mode-toggle"
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentView('main')}
                  disabled={isSubmittingSOS}
                  className="flex-1 rounded-xl h-11 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmSOS}
                  disabled={isSubmittingSOS}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingSOS ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting SOS...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Confirm & Send SOS</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ================= VIEW: SOS RESULT ================= */}
          {currentView === 'sos_result' && sosResult && (
            <div className="space-y-4">
              {sosResult.success ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2.5 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-950">
                        Emergency Alert Recorded
                      </h4>
                      <p className="text-[11px] text-emerald-800/90">
                        Incident ID: <span className="font-mono font-bold">{sosResult.incidentId}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-900 pt-1 border-t border-emerald-200/80">
                    {sosResult.message}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2.5 text-rose-800">
                    <AlertCircle className="w-6 h-6 shrink-0 text-rose-600" />
                    <div>
                      <h4 className="text-sm font-extrabold text-rose-950">
                        SOS Transmission Unconfirmed
                      </h4>
                      <p className="text-[11px] text-rose-800/90">
                        Server could not verify dispatch. Please contact authorities directly.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-rose-900 pt-1 border-t border-rose-200/80">
                    {sosResult.errorMessage}
                  </p>
                </div>
              )}

              {/* Authorized Test Mode Banner */}
              {sosResult.isTestMode && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-amber-950">Authorized Test Alert Mode</h5>
                    <p className="text-[11px] text-amber-900/90 leading-tight mt-0.5">
                      Messages were dispatched via Twilio with the prefix <span className="font-mono font-bold">[TEST ALERT]</span> to verified test contacts only.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Breakdown */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Signal Delivery Status
                </Label>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Database Record:</span>
                    <Badge className={sosResult.success ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                      {sosResult.success ? 'Created & Persisted' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">GPS Coordinates Broadcast:</span>
                    <span className="font-medium text-slate-800">
                      {sosResult.locationShared && sosResult.latitude && sosResult.longitude
                        ? `${sosResult.latitude.toFixed(4)}, ${sosResult.longitude.toFixed(4)}`
                        : 'Not Transmitted (GPS Unavailable)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">In-App Notification:</span>
                    <Badge className="bg-teal-100 text-teal-800">
                      Dispatched
                    </Badge>
                  </div>
                  <div className="py-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">External Cellular SMS / Voice:</span>
                      <Badge variant="outline" className={sosResult.isTwilioConfigured ? "text-teal-800 bg-teal-50 border-teal-300" : "text-amber-800 bg-amber-50 border-amber-300"}>
                        {sosResult.isTwilioConfigured ? 'Twilio Active' : 'Not Configured'}
                      </Badge>
                    </div>
                    {sosResult.isTwilioConfigured ? (
                      <div className="mt-1 space-y-1">
                        <p className="text-[10px] text-teal-800 leading-snug">
                          Twilio Programmable Messaging dispatched emergency SMS alerts.
                        </p>
                        {!sosResult.isStatusCallbackConfigured && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/90 text-[10px] text-amber-900 leading-tight">
                            <span className="font-bold">Status Callback Note:</span> <code className="font-mono text-[9px]">TWILIO_STATUS_CALLBACK_URL</code> is empty or not configured. The initial handoff to Twilio is verified (see SIDs below), but carrier delivery receipts are not automatically tracked via webhook.
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                        External telephony gateway (e.g., Twilio) is unconfigured. Emergency contacts have not received an external SMS. Please dial their numbers directly below.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Per-Recipient Dispatch Tracking */}
              {sosResult.dispatchRecords && sosResult.dispatchRecords.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contact SMS Delivery Tracking ({sosResult.dispatchRecords.length})
                  </Label>
                  <div className="space-y-2">
                    {sosResult.dispatchRecords.map((rec, idx) => (
                      <div
                        key={rec.contactId || idx}
                        className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {rec.contactName || 'Emergency Contact'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {rec.phone || 'No phone'} • SMS
                          </p>
                          {rec.messageSid && (
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                              SID: {rec.messageSid}
                            </p>
                          )}
                          {rec.errorMessage && (
                            <p className="text-[10px] text-rose-600 mt-0.5">
                              {rec.errorMessage}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <Badge
                            variant="outline"
                            className={
                              rec.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                : rec.status === 'sent' || rec.status === 'queued'
                                ? 'bg-teal-50 text-teal-800 border-teal-300 font-bold'
                                : rec.status === 'failed'
                                ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                                : 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                            }
                          >
                            {rec.status === 'queued'
                              ? 'Queued (Twilio)'
                              : rec.status === 'sent'
                              ? 'Sent (In-Transit)'
                              : rec.status === 'delivered'
                              ? 'Delivered'
                              : rec.status === 'unconfigured'
                              ? 'Gateway Offline'
                              : rec.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight italic">
                    * Status is updated live based on carrier delivery receipts. HealthSphere never simulates a successful delivery.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  onClick={handleCallEmergencyServices}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 text-xs font-black shadow-md flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call 112 Immediately</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentView('contacts')}
                  className="w-full rounded-xl h-11 text-xs font-bold"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Call Saved Emergency Contacts
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentView('main')}
                  className="w-full text-xs text-slate-600 font-semibold"
                >
                  Back to Emergency Assistance
                </Button>
              </div>
            </div>
          )}

          {/* ================= VIEW: EMERGENCY CONTACTS ================= */}
          {currentView === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Emergency Contacts ({contacts.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Contacts alerted when an SOS signal is transmitted.
                  </p>
                </div>
                {!isAddingContact && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setEditingContactId(null);
                      setContactName('');
                      setContactPhone('');
                      setContactRelation('');
                      setContactIsPrimary(false);
                      setIsAddingContact(true);
                    }}
                    className="bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold h-8"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Contact
                  </Button>
                )}
              </div>

              {/* Add / Edit Contact Form */}
              {isAddingContact && (
                <form onSubmit={handleSaveContact} className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-extrabold text-teal-950">
                      {editingContactId ? 'Edit Emergency Contact' : 'New Emergency Contact'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingContact(false);
                        setEditingContactId(null);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {contactFormError && (
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-800 text-xs">
                      {contactFormError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <Label htmlFor="contact-name" className="text-[11px] font-bold text-slate-700">
                        Full Name *
                      </Label>
                      <Input
                        id="contact-name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g., Sarah Jenkins"
                        className="h-8 text-xs bg-white mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone" className="text-[11px] font-bold text-slate-700">
                        Phone Number *
                      </Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="e.g., +1-555-0199"
                        className="h-8 text-xs bg-white mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                    <div>
                      <Label htmlFor="contact-relation" className="text-[11px] font-bold text-slate-700">
                        Relationship
                      </Label>
                      <Input
                        id="contact-relation"
                        value={contactRelation}
                        onChange={(e) => setContactRelation(e.target.value)}
                        placeholder="e.g., Spouse, Parent, Doctor"
                        className="h-8 text-xs bg-white mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="contact-primary"
                        checked={contactIsPrimary}
                        onChange={(e) => setContactIsPrimary(e.target.checked)}
                        className="rounded border-slate-300 text-teal-700 focus:ring-teal-500 h-4 w-4"
                      />
                      <Label htmlFor="contact-primary" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Mark as Primary Contact
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAddingContact(false);
                        setEditingContactId(null);
                      }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-teal-700 hover:bg-teal-800 text-white font-bold h-8 text-xs">
                      {editingContactId ? 'Save Changes' : 'Add Contact'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Contacts List */}
              {contactsLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No emergency contacts saved</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Add family members, trusted physicians, or caregivers to reach them with 1-tap dialer or SOS broadcasts.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-extrabold text-slate-900 truncate">
                            {c.name}
                          </h5>
                          {c.isPrimary && (
                            <Badge className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0 h-4 font-bold border-rose-200">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {c.phone} • <span className="text-slate-600">{c.relation}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Dial Button */}
                        <a
                          href={`tel:${c.phone}`}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors inline-flex items-center gap-1 border border-teal-200"
                          aria-label={`Call ${c.name}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Call</span>
                        </a>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEditContact(c)}
                          className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => void handleDeleteContact(c.id)}
                          className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors"
                          aria-label={`Delete ${c.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW: MEDICAL ID ================= */}
          {currentView === 'medical_id' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Emergency Medical ID
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Critical clinical data for first responders.
                  </p>
                </div>
                <Badge className="bg-rose-100 text-rose-800 text-[10px] border-rose-200">
                  Private Record
                </Badge>
              </div>

              {medicalProfileLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading Medical ID...</div>
              ) : (
                <div className="space-y-3">
                  {/* Top Summary Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-slate-50 border border-rose-200/80 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {medicalProfile?.fullName || 'Not provided'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Health ID: {medicalProfile?.healthId || 'Unlinked'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Blood Group
                        </span>
                        <Badge className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 mt-0.5">
                          {medicalProfile?.bloodGroup || 'Not provided'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-rose-200/60">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Age / DOB
                        </span>
                        <span className="font-semibold text-slate-800">
                          {medicalProfile?.age != null ? `${medicalProfile.age} yrs` : medicalProfile?.dateOfBirth || 'Not provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Last Updated
                        </span>
                        <span className="font-semibold text-slate-800">
                          {medicalProfile?.lastUpdated || 'Not verified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Known Allergies
                    </span>
                    {medicalProfile?.allergies && medicalProfile.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {medicalProfile.allergies.map((allergy, idx) => (
                          <Badge key={idx} className="bg-rose-100 text-rose-800 border-rose-200 text-xs font-bold">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">None reported or not provided.</p>
                    )}
                  </div>

                  {/* Conditions & Medications */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Chronic Medical Conditions
                    </span>
                    {medicalProfile?.chronicDiseases && medicalProfile.chronicDiseases.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {medicalProfile.chronicDiseases.map((disease, idx) => (
                          <Badge key={idx} className="bg-amber-100 text-amber-900 border-amber-200 text-xs font-bold">
                            {disease}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No chronic conditions recorded.</p>
                    )}
                  </div>

                  {/* Surgeries / History */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Surgeries & Past Medical History
                    </span>
                    {medicalProfile?.surgeries && medicalProfile.surgeries.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {medicalProfile.surgeries.map((s, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white text-slate-800 border-slate-300 text-xs font-medium">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No past surgeries recorded.</p>
                    )}
                  </div>

                  {/* Primary Contact */}
                  {medicalProfile?.emergencyContact && (
                    <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                          Primary Emergency Contact
                        </span>
                        <p className="text-xs font-extrabold text-slate-900">
                          {medicalProfile.emergencyContact}
                          {medicalProfile.emergencyContactPhone && (
                            <span className="font-mono text-slate-600 font-normal ml-1.5">
                              ({medicalProfile.emergencyContactPhone})
                            </span>
                          )}
                        </p>
                      </div>
                      {medicalProfile.emergencyContactPhone && (
                        <a
                          href={`tel:${medicalProfile.emergencyContactPhone}`}
                          className="px-2.5 py-1 rounded-xl bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-teal-800"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-100/70 text-slate-500 text-[10px] leading-tight flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      Private Medical ID. This information is confidential and is only accessible from your authenticated HealthSphere session. Nonfunctional QR-code export has been removed for privacy protection.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW: NEARBY HOSPITALS ================= */}
          {currentView === 'hospitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Nearby Hospitals
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Live emergency healthcare facilities from OpenStreetMap.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadHospitals()}
                  disabled={hospitalsLoading || !geoLocation}
                  className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${hospitalsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {!geoLocation ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2.5">
                  <MapPin className="w-8 h-8 text-amber-600 mx-auto" />
                  <h5 className="text-xs font-extrabold text-amber-950">
                    Location Access Required
                  </h5>
                  <p className="text-[11px] text-amber-900/80 max-w-sm mx-auto">
                    HealthSphere requires your GPS location to calculate distances to nearby emergency departments.
                  </p>
                  <Button
                    type="button"
                    onClick={() => void requestLocation()}
                    disabled={geoLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold h-9 shadow-xs"
                  >
                    {geoLoading ? 'Detecting Location...' : 'Enable Location Permission'}
                  </Button>
                </div>
              ) : hospitalsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                  <p>Searching OpenStreetMap for nearby emergency facilities...</p>
                </div>
              ) : hospitalsError ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
                  <p className="text-xs font-bold text-rose-900">Unable to load nearby facilities</p>
                  <p className="text-[11px] text-rose-700">{hospitalsError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void loadHospitals()}
                    className="text-xs font-bold rounded-xl"
                  >
                    Try Again
                  </Button>
                </div>
              ) : hospitals.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No hospitals found within 5km</p>
                  <p className="text-[11px] text-slate-500">
                    No emergency medical centers are registered in the immediate radius. Dial 112 for direct emergency dispatch.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {hospitals.map((h) => (
                    <div
                      key={h.id}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-extrabold text-slate-900">
                            {h.name}
                          </h5>
                          {h.address && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {h.address}
                            </p>
                          )}
                        </div>
                        {h.distance != null && (
                          <Badge className="bg-teal-100 text-teal-800 text-[10px] font-bold border-teal-200 shrink-0">
                            {formatDistance(h.distance)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70">
                        {h.phone ? (
                          <a
                            href={`tel:${h.phone}`}
                            className="flex-1 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold text-center border border-teal-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="flex-1 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium text-center cursor-not-allowed"
                          >
                            No Phone Listed
                          </button>
                        )}

                        <a
                          href={`https://www.openstreetmap.org/directions?from=${geoLocation.latitude},${geoLocation.longitude}&to=${h.latitude},${h.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Directions
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW: SHARE LOCATION ================= */}
          {currentView === 'location' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Live Location Sharing
                </h4>
                <p className="text-[11px] text-slate-500">
                  Verified device coordinates for emergency services.
                </p>
              </div>

              {geoLocation ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-950">
                        GPS Active
                      </span>
                      <span className="text-[11px] text-emerald-800 font-medium">
                        Accuracy: ±{Math.round(geoLocation.accuracy)}m
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Latitude</span>
                        <p className="font-mono font-bold text-slate-900 mt-0.5">
                          {geoLocation.latitude.toFixed(6)}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Longitude</span>
                        <p className="font-mono font-bold text-slate-900 mt-0.5">
                          {geoLocation.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCopyLocation}
                        variant="outline"
                        className="flex-1 bg-white hover:bg-slate-50 rounded-xl h-9 text-xs font-bold"
                      >
                        {copiedCoords ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" /> Copy Coordinates
                          </>
                        )}
                      </Button>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${geoLocation.latitude}&mlon=${geoLocation.longitude}#map=17/${geoLocation.latitude}/${geoLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open in Map
                      </a>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void requestLocation()}
                    disabled={geoLoading}
                    className="w-full text-xs font-bold text-teal-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${geoLoading ? 'animate-spin' : ''}`} />
                    Refresh GPS Fix
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">
                      GPS Location Not Granted
                    </h5>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                      {geoError || 'Allow location access in your browser to broadcast precise GPS coordinates.'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => void requestLocation()}
                    disabled={geoLoading}
                    className="bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold h-9"
                  >
                    {geoLoading ? 'Requesting GPS...' : 'Grant Location Permission'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ================= VIEW: HISTORY ================= */}
          {currentView === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Emergency Incident History
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Verified persisted audit records of manual and auto-escalated SOS events.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadHistory()}
                  disabled={historyLoading}
                  className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {historyLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading audit log...</div>
              ) : historyItems.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No emergency incidents on record</p>
                  <p className="text-[11px] text-slate-500">
                    Verified records of manual SOS dispatches and triage events will be preserved here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {historyItems.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            inc.severity === 'CRITICAL'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {inc.severity}
                          </span>
                          <span className="font-bold text-slate-900 truncate">
                            {inc.triggerReason}
                          </span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] font-bold ${
                          inc.status === 'active'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                          {inc.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
                        <div>
                          <span className="font-semibold text-slate-600">Timestamp: </span>
                          <span>{inc.timestamp}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Location: </span>
                          <span>{inc.location?.latitude ? 'Coordinates Shared' : 'Unavailable'}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-500 leading-snug">
                        <strong>Delivery:</strong> In-app event logged. External carrier gateway (Twilio) unconfigured.
                      </div>

                      {inc.status === 'active' && (
                        <div className="pt-1 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await api.put(`/emergency/${inc.id}/resolve`, { status: 'resolved' });
                                await loadHistory();
                              } catch (err: any) {
                                alert(err?.message || 'Could not resolve incident');
                              }
                            }}
                            className="h-7 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            Resolve Alert
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
