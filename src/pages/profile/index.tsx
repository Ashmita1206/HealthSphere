import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Save,
  Activity,
  PhoneCall,
  FileText,
  ShieldCheck,
  Settings,
  Heart,
} from 'lucide-react';

import { ProfileHero } from '@/components/profile/ProfileHero';
import { HealthMetricsGrid } from '@/components/profile/HealthMetricsGrid';
import { AchievementsSection } from '@/components/profile/AchievementsSection';
import { HealthDocumentsVault } from '@/components/profile/HealthDocumentsVault';
import { EmergencyContact } from '@/components/profile/EmergencyContact';
import { Preferences } from '@/components/profile/Preferences';
import { useMedicalProfile } from '@/context/MedicalProfileContext';
import {
  medicalProfileService,
  type MedicalProfileData,
} from '@/services/medicalProfileService';
import {
  DigitalHealthCard,
  QRCodeCard,
  EmergencyCard,
  ProfileCompletion,
  MedicalProfileCard,
  MedicalProfileForm,
} from '@/components/medical-profile';

import {
  createDefaultProfile,
  normalizeProfileData,
  mergeProfileAndMedicalData,
  type Profile,
  type ProfileDocument,
} from './profileData';

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile: medicalProfile, saveProfile: saveMedicalProfile, refreshProfile } = useMedicalProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profile, setProfile] = useState<Profile>(createDefaultProfile);

  // Profile Completion Score Calculation
  const calculateCompletionScore = (p: Profile): number => {
    let fields = 0;
    let filled = 0;

    const check = (val: any) => {
      fields++;
      if (Array.isArray(val)) {
        if (val.length > 0) filled++;
      } else if (val !== null && val !== undefined && val !== '' && val !== 0) {
        filled++;
      }
    };

    check(p.full_name);
    check(p.phone);
    check(p.date_of_birth);
    check(p.gender);
    check(p.blood_type);
    check(p.address);
    check(p.emergency_contact_name);
    check(p.emergency_contact_phone);
    check(p.emergency_contact_relationship);
    check(p.insurance_provider);
    check(p.height);
    check(p.weight);
    check(p.allergies);
    check(p.smoking);
    check(p.exercise_level);

    return Math.min(100, Math.round((filled / fields) * 100));
  };

  const completionScore = calculateCompletionScore(profile);

  useEffect(() => {
    if (!user) {
      setProfile(createDefaultProfile());
      setFetchingProfile(false);
      return;
    }

    let isMounted = true;
    setFetchingProfile(true);

    Promise.allSettled([
      api.get<unknown>('/user/profile'),
      medicalProfileService.getMedicalProfile(),
    ])
      .then(([userRes, medRes]) => {
        if (!isMounted) return;
        const userData = userRes.status === 'fulfilled' ? userRes.value : {};
        const medData = medRes.status === 'fulfilled' ? medRes.value : null;
        setProfile(mergeProfileAndMedicalData(userData, medData));
      })
      .catch(() => {
        if (isMounted) setProfile(createDefaultProfile());
      })
      .finally(() => {
        if (isMounted) setFetchingProfile(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Sync profile state when medicalProfile context updates externally
  useEffect(() => {
    if (medicalProfile) {
      setProfile((prev) => mergeProfileAndMedicalData(prev, medicalProfile));
    }
  }, [medicalProfile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Personal Identity portion -> PUT /api/user/profile
      const userProfilePayload = {
        full_name: profile.full_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        blood_type: profile.blood_type,
        address: profile.address,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        health_score: profile.health_score,
      };

      // 2. Clinical Medical Profile portion -> PUT /api/profile/medical
      const clinicalPayload: Partial<MedicalProfileData> = {
        fullName: profile.full_name || medicalProfile?.fullName || 'HealthSphere Patient',
        dateOfBirth: profile.date_of_birth || medicalProfile?.dateOfBirth || '',
        gender: profile.gender || medicalProfile?.gender || '',
        bloodGroup: profile.blood_type || medicalProfile?.bloodGroup || 'Unknown',
        height: typeof profile.height === 'number' ? profile.height : (medicalProfile?.height ?? null),
        weight: typeof profile.weight === 'number' ? profile.weight : (medicalProfile?.weight ?? null),
        allergies: profile.allergies || [],
        chronicDiseases: profile.chronic_diseases || [],
        surgeries: (profile.surgeries || []).map((s) =>
          typeof s === 'string' ? { name: s } : s
        ),
        familyHistory: (profile.family_history || []).map((f) =>
          typeof f === 'string' ? { relation: 'Family', condition: f } : f
        ),
        lifestyle: {
          smoking: profile.smoking || 'never',
          alcohol: profile.alcohol || 'never',
          activityLevel: profile.exercise_level || 'moderate',
          diet: profile.diet_preference || 'balanced',
        },
        insurance: {
          provider: profile.insurance_provider || '',
          policyNumber: profile.insurance_policy_number || '',
        },
        organDonor: Boolean(profile.organ_donor),
        address: {
          street: profile.address || '',
        },
        emergencyContacts: profile.emergency_contact_name
          ? [
              {
                name: profile.emergency_contact_name,
                phone: profile.emergency_contact_phone,
                relationship: profile.emergency_contact_relationship || 'Emergency Contact',
                isPrimary: true,
              },
            ]
          : (medicalProfile?.emergencyContacts || []),
      };

      // Concurrently persist both domains
      const [userRes, medOk] = await Promise.all([
        api.put('/user/profile', userProfilePayload),
        saveMedicalProfile(clinicalPayload),
      ]);

      if (userRes) {
        setProfile((prev) => mergeProfileAndMedicalData(userRes, clinicalPayload));
      }

      await refreshProfile();

      toast({
        title: 'Profile & Clinical Records Saved',
        description: 'Personal details and lifelong medical profile persisted successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err?.message || 'Failed saving profile updates. Please retry.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((currentProfile) =>
      normalizeProfileData({ ...currentProfile, ...updates })
    );
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthSphere_Profile_${profile.full_name || 'Patient'}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: 'Profile JSON Exported',
      description: 'Downloaded complete medical record JSON file.',
    });
  };

  const handlePrintCard = () => {
    toast({
      title: 'Opening Print Preview',
      description: 'Launching system print dialog for Medical Card...',
    });
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleUploadDocument = (newDoc: ProfileDocument) => {
    setProfile((prev) => ({
      ...prev,
      documents: [newDoc, ...(prev.documents || [])],
    }));
  };

  const handleDeleteDocument = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((d) => d.id !== id),
    }));
    toast({ title: 'Document Removed', description: 'File removed from vault.' });
  };

  if (fetchingProfile) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-28 animate-pulse bg-slate-200/60 rounded-3xl" />
        <div className="h-64 animate-pulse bg-slate-200/60 rounded-3xl" />
        <div className="h-48 animate-pulse bg-slate-200/60 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Patient Profile & Health Records"
        description="Comprehensive clinical demographics, emergency contacts, vital biometrics, and medical document vault."
        breadcrumbs={[{ label: 'Profile' }]}
        badge="HIPAA 256-Bit Encrypted"
        actions={
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </Button>
        }
      />

      {/* Hero Header */}
      <ProfileHero
        profile={profile}
        completionScore={completionScore}
        onExportJson={handleExportJson}
        onPrintCard={handlePrintCard}
      />

      {/* Profile Completeness Assessment & Actionable Suggestions */}
      <ProfileCompletion
        profile={medicalProfile}
      />

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl flex flex-wrap h-auto gap-1 border border-slate-200/80">
          <TabsTrigger
            value="overview"
            className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-teal-700 data-[state=active]:text-white transition-all flex items-center gap-1.5"
          >
            <Activity className="h-3.5 w-3.5" /> Clinical Overview
          </TabsTrigger>

          <TabsTrigger
            value="idcard"
            className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-teal-700 data-[state=active]:text-white transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Digital Health ID & QR
          </TabsTrigger>

          <TabsTrigger
            value="edit-medical"
            className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-teal-700 data-[state=active]:text-white transition-all flex items-center gap-1.5"
          >
            <Heart className="h-3.5 w-3.5" /> Lifelong Medical Profile
          </TabsTrigger>

          <TabsTrigger
            value="documents"
            className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-teal-700 data-[state=active]:text-white transition-all flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" /> Health Records Vault
          </TabsTrigger>

          <TabsTrigger
            value="emergency"
            className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-teal-700 data-[state=active]:text-white transition-all flex items-center gap-1.5"
          >
            <PhoneCall className="h-3.5 w-3.5" /> Emergency Contacts
          </TabsTrigger>

          <TabsTrigger
            value="settings"
            className="rounded-xl text-xs font-bold px-4 py-2.5 data-[state=active]:bg-teal-700 data-[state=active]:text-white transition-all flex items-center gap-1.5"
          >
            <Settings className="h-3.5 w-3.5" /> Preferences & Settings
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Clinical Overview */}
        <TabsContent value="overview" className="space-y-6">
          <MedicalProfileCard profile={medicalProfile} />
          <HealthMetricsGrid profile={profile} />
          <AchievementsSection profile={profile} />
        </TabsContent>

        {/* Tab 2: Digital Health ID & QR Code & Emergency Access */}
        <TabsContent value="idcard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <DigitalHealthCard profile={medicalProfile} />
              <EmergencyCard profile={medicalProfile} />
            </div>
            <div className="space-y-6">
              <QRCodeCard
                healthId={medicalProfile?.healthId || 'HS-2026-000123'}
                fullName={medicalProfile?.fullName || profile.full_name}
                bloodGroup={medicalProfile?.bloodGroup || profile.blood_type}
                qrData={medicalProfile?.qrData}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Complete Lifelong Medical Profile Editor */}
        <TabsContent value="edit-medical" className="space-y-6">
          <MedicalProfileForm
            initialData={medicalProfile}
            onSave={async (data) => {
              const success = await saveMedicalProfile(data);
              if (success) {
                setProfile((prev) => mergeProfileAndMedicalData(prev, data as any));
              }
              return success;
            }}
          />
        </TabsContent>

        {/* Tab 4: Health Records Vault */}
        <TabsContent value="documents" className="space-y-6">
          <HealthDocumentsVault
            documents={profile.documents || []}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        </TabsContent>

        {/* Tab 5: Emergency Contacts & Legacy Information */}
        <TabsContent value="emergency" className="space-y-6">
          <EmergencyCard profile={medicalProfile} />
          <EmergencyContact
            emergency_contact_name={profile.emergency_contact_name}
            emergency_contact_phone={profile.emergency_contact_phone}
            emergency_contact_relationship={profile.emergency_contact_relationship}
            insurance_provider={profile.insurance_provider}
            insurance_policy_number={profile.insurance_policy_number}
            organ_donor={profile.organ_donor}
            primary_physician={profile.primary_physician}
            preferred_hospital={profile.preferred_hospital}
            updateProfile={updateProfile}
          />
        </TabsContent>

        {/* Tab 6: Preferences & Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Preferences
            language={profile.language}
            units={profile.units}
            notification_preferences={profile.notification_preferences}
            updateProfile={updateProfile}
            onExportJson={handleExportJson}
            onPrintCard={handlePrintCard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
