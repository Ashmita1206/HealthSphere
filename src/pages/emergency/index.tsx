import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import {
  createDefaultProfile,
  normalizeProfileData,
  type Profile,
} from '@/pages/profile/profileData';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmergencyDashboard } from '@/components/emergency/EmergencyDashboard';
import { SOSButton } from '@/components/emergency/SOSButton';
import { EmergencyContacts, EmergencyContact } from '@/components/emergency/EmergencyContacts';
import { MedicalCard } from '@/components/emergency/MedicalCard';
import { NearbyHospitals } from '@/components/emergency/NearbyHospitals';
import { NearbyAmbulances } from '@/components/emergency/NearbyAmbulances';
import { BloodRequirement } from '@/components/emergency/BloodRequirement';
import { EmergencyChecklist } from '@/components/emergency/EmergencyChecklist';
import { LocationStatus } from '@/components/emergency/LocationStatus';
import { EmergencyTimeline } from '@/components/emergency/EmergencyTimeline';
import { EmergencyStats } from '@/components/emergency/EmergencyStats';
import { EmergencySkeleton } from '@/components/emergency/EmergencySkeleton';
import { downloadMedicalCard, printMedicalCard, exportEmergencyContactsToJSON, exportEmergencyContactsToCSV } from '@/components/emergency/emergencyExportUtils';

interface TimelineEvent {
  id: string;
  type: 'sos-triggered' | 'cancelled' | 'card-shared' | 'location-shared' | 'call-started';
  timestamp: string;
  description: string;
}

const calculateAge = (dateOfBirth: string): number | undefined => {
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return undefined;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
};

export default function EmergencyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(createDefaultProfile);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [sosSent, setSosSent] = useState(0);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [checklistItems, setChecklistItems] = useState([
    { id: 'medicines', label: 'Carry medicines', checked: false },
    { id: 'identity', label: 'Identity card', checked: false },
    { id: 'insurance', label: 'Insurance documents', checked: false },
    { id: 'contact', label: 'Emergency contact', checked: false },
    { id: 'water', label: 'Water bottle', checked: false },
    { id: 'cash', label: 'Cash', checked: false },
    { id: 'phone', label: 'Charged phone', checked: false },
    { id: 'powerbank', label: 'Power bank', checked: false },
    { id: 'firstaid', label: 'First aid kit', checked: false },
    { id: 'snacks', label: 'Emergency snacks', checked: false },
  ]);

  const sosReady = useMemo(() => {
    return contacts.length > 0 && locationEnabled;
  }, [contacts.length, locationEnabled]);

  const profileAge = useMemo(
    () => calculateAge(profile.date_of_birth),
    [profile.date_of_birth],
  );

  const medicalCardComplete = useMemo(
    () => Boolean(profile.full_name && profile.blood_type && profileAge),
    [profile.full_name, profile.blood_type, profileAge],
  );

  const preparednessScore = useMemo(() => {
    const completedChecklist = checklistItems.filter((item) => item.checked).length;
    const contactScore = contacts.length > 0 ? 20 : 0;
    const medicalScore = medicalCardComplete ? 20 : 0;
    const locationScore = locationEnabled ? 20 : 0;
    const checklistScore = (completedChecklist / checklistItems.length) * 40;
    return Math.round(contactScore + medicalScore + locationScore + checklistScore);
  }, [checklistItems, contacts.length, medicalCardComplete, locationEnabled]);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      // TODO: Backend integration for emergency contacts
      // TODO: Backend integration for emergency timeline
      try {
        const data = user
          ? await api.get<unknown>('/user/profile')
          : createDefaultProfile();
        if (active) setProfile(normalizeProfileData(data));
      } catch {
        if (active) setProfile(createDefaultProfile());
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchData();

    return () => {
      active = false;
    };
  }, [user]);

  const handleSOSTriggered = useCallback(() => {
    setSosSent((prev) => prev + 1);
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      type: 'sos-triggered',
      timestamp: new Date().toISOString(),
      description: 'SOS emergency alert triggered',
    };
    setTimeline((prev) => [newEvent, ...prev]);
    toast({
      title: 'SOS Triggered',
      description: 'Emergency alert sent to your contacts',
      variant: 'destructive',
    });
  }, [toast]);

  const handleAddContact = useCallback((contact: EmergencyContact) => {
    // TODO: Backend integration for contact creation
    setContacts((prev) => [...prev, contact]);
    toast({ title: 'Emergency Contact Added' });
  }, [toast]);

  const handleEditContact = useCallback((contact: EmergencyContact) => {
    // TODO: Backend integration for contact update
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? contact : c)));
    toast({ title: 'Emergency Contact Updated' });
  }, [toast]);

  const handleDeleteContact = useCallback((id: string) => {
    // TODO: Backend integration for contact deletion
    setContacts((prev) => prev.filter((c) => c.id !== id));
    toast({ title: 'Emergency Contact Deleted' });
  }, [toast]);

  const handleBloodRequest = useCallback((data: any) => {
    // TODO: Backend integration for blood requirement request
    toast({
      title: 'Blood Request Generated',
      description: 'Emergency blood request sent',
    });
  }, [toast]);

  const handleLocationRefresh = useCallback(() => {
    // TODO: Backend integration for location refresh
    toast({ title: 'Location Refreshed' });
  }, [toast]);

  const handleChecklistToggle = useCallback((id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }, []);

  const handleDownloadCard = useCallback(() => {
    downloadMedicalCard({
      name: profile.full_name,
      bloodGroup: profile.blood_type,
      age: profileAge,
      allergies: profile.allergies ?? [],
      chronicDiseases: profile.chronic_diseases ?? [],
      surgeries: profile.surgeries ?? [],
      emergencyContact: contacts.find((c) => c.priority === 'primary')?.phone,
      healthId: user?.id,
    });
    toast({ title: 'Medical Card Downloaded' });
  }, [profile, profileAge, contacts, toast, user?.id]);

  const handlePrintCard = useCallback(() => {
    printMedicalCard({
      name: profile.full_name,
      bloodGroup: profile.blood_type,
      age: profileAge,
      allergies: profile.allergies ?? [],
      chronicDiseases: profile.chronic_diseases ?? [],
      surgeries: profile.surgeries ?? [],
      emergencyContact: contacts.find((c) => c.priority === 'primary')?.phone,
      healthId: user?.id,
    });
  }, [profile, profileAge, contacts, user?.id]);

  const handleExportContactsJSON = useCallback(() => {
    exportEmergencyContactsToJSON(contacts);
    toast({ title: 'Contacts Exported to JSON' });
  }, [contacts, toast]);

  const handleExportContactsCSV = useCallback(() => {
    exportEmergencyContactsToCSV(contacts);
    toast({ title: 'Contacts Exported to CSV' });
  }, [contacts, toast]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Emergency SOS"
          description="Quick emergency access and preparedness tools."
          breadcrumbs={[{ label: 'Emergency' }]}
          badge="Emergency"
        />
        <EmergencySkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Emergency SOS"
        description="Quick emergency access and preparedness tools."
        breadcrumbs={[{ label: 'Emergency' }]}
        badge="Emergency"
      />

      {/* Dashboard */}
      <EmergencyDashboard
        sosReady={sosReady}
        emergencyContactsCount={contacts.length}
        medicalCardComplete={medicalCardComplete}
        locationEnabled={locationEnabled}
      />

      {/* SOS Button */}
      <div className="flex justify-center">
        <SOSButton onSOSTriggered={handleSOSTriggered} />
      </div>

      {/* Stats */}
      <EmergencyStats
        sosSent={sosSent}
        emergencyContacts={contacts.length}
        nearbyHospitals={3}
        preparednessScore={preparednessScore}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Emergency Contacts */}
          <EmergencyContacts
            contacts={contacts}
            onAdd={handleAddContact}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
          />

          {/* Nearby Hospitals */}
          <NearbyHospitals />

          {/* Nearby Ambulances */}
          <NearbyAmbulances />

          {/* Emergency Timeline */}
          <EmergencyTimeline events={timeline} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Medical Card */}
          <MedicalCard
            profile={{
              name: profile.full_name,
              bloodGroup: profile.blood_type,
              age: profileAge,
              allergies: profile.allergies ?? [],
              chronicDiseases: profile.chronic_diseases ?? [],
              surgeries: profile.surgeries ?? [],
              emergencyContact: contacts.find((c) => c.priority === 'primary')?.phone,
              healthId: user?.id,
            }}
            onDownload={handleDownloadCard}
            onPrint={handlePrintCard}
          />

          {/* Blood Requirement */}
          <BloodRequirement onRequest={handleBloodRequest} />

          {/* Emergency Checklist */}
          <EmergencyChecklist
            items={checklistItems}
            onToggle={handleChecklistToggle}
          />

          {/* Location Status */}
          <LocationStatus onRefresh={handleLocationRefresh} />
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          onClick={handleExportContactsJSON}
          className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Export Contacts (JSON)
        </button>
        <button
          type="button"
          onClick={handleExportContactsCSV}
          className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Export Contacts (CSV)
        </button>
      </div>
    </div>
  );
}
