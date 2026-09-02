import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Heart,
  Droplet,
  Shield,
  Phone,
  Activity,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react';
import type { MedicalProfileData, EmergencyContact } from '@/services/medicalProfileService';

interface MedicalProfileFormProps {
  initialData?: MedicalProfileData | null;
  onSave: (data: Partial<MedicalProfileData>) => Promise<boolean>;
}

export const MedicalProfileForm: React.FC<MedicalProfileFormProps> = ({
  initialData,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'vitals' | 'clinical' | 'emergency' | 'lifestyle'>('personal');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
  const [gender, setGender] = useState(initialData?.gender || 'male');
  const [bloodGroup, setBloodGroup] = useState(initialData?.bloodGroup || 'O+');
  const [height, setHeight] = useState(initialData?.height ? String(initialData.height) : '');
  const [weight, setWeight] = useState(initialData?.weight ? String(initialData.weight) : '');
  const [organDonor, setOrganDonor] = useState(initialData?.organDonor || false);

  // Dynamic Array Fields
  const [allergiesText, setAllergiesText] = useState(initialData?.allergies?.join(', ') || '');
  const [chronicDiseasesText, setChronicDiseasesText] = useState(initialData?.chronicDiseases?.join(', ') || '');
  const [medicationsText, setMedicationsText] = useState(initialData?.currentMedications?.join(', ') || '');

  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    initialData?.emergencyContacts?.length
      ? initialData.emergencyContacts
      : [{ name: 'Jane Doe', relationship: 'Spouse', phone: '+1 (555) 987-6543', isPrimary: true }]
  );

  // Insurance
  const [insuranceProvider, setInsuranceProvider] = useState(initialData?.insurance?.provider || '');
  const [policyNumber, setPolicyNumber] = useState(initialData?.insurance?.policyNumber || '');

  // Lifestyle
  const [smoking, setSmoking] = useState(initialData?.lifestyle?.smoking || 'never');
  const [alcohol, setAlcohol] = useState(initialData?.lifestyle?.alcohol || 'never');
  const [activityLevel, setActivityLevel] = useState(initialData?.lifestyle?.activityLevel || 'moderate');
  const [diet, setDiet] = useState(initialData?.lifestyle?.diet || 'balanced');

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setDateOfBirth(initialData.dateOfBirth || '');
      setGender(initialData.gender || 'male');
      setBloodGroup(initialData.bloodGroup || 'O+');
      setHeight(initialData.height ? String(initialData.height) : '');
      setWeight(initialData.weight ? String(initialData.weight) : '');
      setOrganDonor(!!initialData.organDonor);
      setAllergiesText(initialData.allergies?.join(', ') || '');
      setChronicDiseasesText(initialData.chronicDiseases?.join(', ') || '');
      setMedicationsText(initialData.currentMedications?.join(', ') || '');
      if (initialData.emergencyContacts?.length) {
        setEmergencyContacts(initialData.emergencyContacts);
      }
      setInsuranceProvider(initialData.insurance?.provider || '');
      setPolicyNumber(initialData.insurance?.policyNumber || '');
      setSmoking(initialData.lifestyle?.smoking || 'never');
      setAlcohol(initialData.lifestyle?.alcohol || 'never');
      setActivityLevel(initialData.lifestyle?.activityLevel || 'moderate');
      setDiet(initialData.lifestyle?.diet || 'balanced');
    }
  }, [initialData]);

  const handleAddContact = () => {
    setEmergencyContacts((prev) => [
      ...prev,
      { name: '', relationship: 'Family', phone: '', isPrimary: false },
    ]);
  };

  const handleRemoveContact = (index: number) => {
    setEmergencyContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateContact = (index: number, field: keyof EmergencyContact, val: string | boolean) => {
    setEmergencyContacts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Partial<MedicalProfileData> = {
      fullName: fullName.trim() || 'HealthSphere Patient',
      dateOfBirth,
      gender,
      bloodGroup,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      organDonor,
      allergies: allergiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      chronicDiseases: chronicDiseasesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      currentMedications: medicationsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      emergencyContacts: emergencyContacts.filter((c) => c.name.trim() && c.phone.trim()),
      insurance: {
        provider: insuranceProvider.trim(),
        policyNumber: policyNumber.trim(),
      },
      lifestyle: {
        smoking,
        alcohol,
        activityLevel,
        diet,
      },
    };

    const success = await onSave(payload);
    setSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'vitals', label: 'Blood & Vitals', icon: Droplet },
    { id: 'clinical', label: 'Clinical History', icon: Heart },
    { id: 'emergency', label: 'Emergency & Insurance', icon: Phone },
    { id: 'lifestyle', label: 'Lifestyle', icon: Activity },
  ];

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-extrabold text-slate-900 font-heading">
              Edit Lifelong Medical Profile
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500">
              Keep your digital health identity and clinical history current
            </CardDescription>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 -mb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TAB 1: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">
                  Full Legal Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="rounded-xl text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-xs font-bold text-slate-700">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Gender</Label>
                <Select value={gender} onValueChange={(val) => setGender(val)}>
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* TAB 2: VITALS & BLOOD */}
          {activeTab === 'vitals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Blood Group</Label>
                <Select value={bloodGroup} onValueChange={(val) => setBloodGroup(val)}>
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs font-bold text-slate-700">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs font-bold text-slate-700">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 70"
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="organDonor"
                  checked={organDonor}
                  onChange={(e) => setOrganDonor(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <Label htmlFor="organDonor" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Registered Organ Donor
                </Label>
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL HISTORY */}
          {activeTab === 'clinical' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="allergies" className="text-xs font-bold text-slate-700">
                  Allergies (comma-separated)
                </Label>
                <Input
                  id="allergies"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="chronic" className="text-xs font-bold text-slate-700">
                  Chronic Conditions & Diseases (comma-separated)
                </Label>
                <Input
                  id="chronic"
                  value={chronicDiseasesText}
                  onChange={(e) => setChronicDiseasesText(e.target.value)}
                  placeholder="e.g. Hypertension, Asthma, Type 2 Diabetes"
                  className="rounded-xl text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meds" className="text-xs font-bold text-slate-700">
                  Current Medications (comma-separated)
                </Label>
                <Input
                  id="meds"
                  value={medicationsText}
                  onChange={(e) => setMedicationsText(e.target.value)}
                  placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                  className="rounded-xl text-xs h-9"
                />
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY & INSURANCE */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">
                    Emergency Contacts ({emergencyContacts.length})
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddContact}
                    className="text-[11px] font-bold h-7 rounded-lg gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Contact
                  </Button>
                </div>

                {emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 items-center"
                  >
                    <Input
                      placeholder="Contact Name"
                      value={contact.name}
                      onChange={(e) => handleUpdateContact(idx, 'name', e.target.value)}
                      className="rounded-lg text-xs h-8 bg-white"
                    />
                    <Input
                      placeholder="Relationship (e.g. Spouse)"
                      value={contact.relationship}
                      onChange={(e) => handleUpdateContact(idx, 'relationship', e.target.value)}
                      className="rounded-lg text-xs h-8 bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Phone Number"
                        value={contact.phone}
                        onChange={(e) => handleUpdateContact(idx, 'phone', e.target.value)}
                        className="rounded-lg text-xs h-8 bg-white flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                        title="Delete contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <Label htmlFor="insurance" className="text-xs font-bold text-slate-700">
                    Insurance Provider
                  </Label>
                  <Input
                    id="insurance"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. BlueCross BlueShield"
                    className="rounded-xl text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="policyNumber" className="text-xs font-bold text-slate-700">
                    Policy Number
                  </Label>
                  <Input
                    id="policyNumber"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="e.g. BC-99482716"
                    className="rounded-xl text-xs h-9"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIFESTYLE */}
          {activeTab === 'lifestyle' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Smoking Status</Label>
                <Select value={smoking} onValueChange={(val) => setSmoking(val)}>
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Select smoking status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never smoked</SelectItem>
                    <SelectItem value="former">Former smoker</SelectItem>
                    <SelectItem value="occasional">Occasional smoker</SelectItem>
                    <SelectItem value="frequent">Daily smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Alcohol Consumption</Label>
                <Select value={alcohol} onValueChange={(val) => setAlcohol(val)}>
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Select alcohol consumption" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Non-drinker</SelectItem>
                    <SelectItem value="social">Social drinker</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="heavy">Frequent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Physical Activity Level</Label>
                <Select value={activityLevel} onValueChange={(val) => setActivityLevel(val)}>
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Lightly active</SelectItem>
                    <SelectItem value="moderate">Moderately active</SelectItem>
                    <SelectItem value="very_active">Very active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Dietary Pattern</Label>
                <Select value={diet} onValueChange={(val) => setDiet(val)}>
                  <SelectTrigger className="rounded-xl text-xs h-9">
                    <SelectValue placeholder="Select dietary pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto / Low-Carb</SelectItem>
                    <SelectItem value="diabetic_friendly">Diabetic Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-2 h-9 px-4 rounded-xl"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Medical Profile'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
