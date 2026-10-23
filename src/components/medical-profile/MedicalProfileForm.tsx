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
  Phone,
  Activity,
  Plus,
  Trash2,
  Save,
  Check,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import type { MedicalProfileData, EmergencyContact } from '@/services/medicalProfileService';

interface MedicalProfileFormProps {
  initialData?: MedicalProfileData | null;
  initialTab?: 'personal' | 'vitals' | 'clinical' | 'emergency' | 'lifestyle';
  onSave: (data: Partial<MedicalProfileData>) => Promise<boolean>;
  onCancel?: () => void;
}

export const MedicalProfileForm: React.FC<MedicalProfileFormProps> = ({
  initialData,
  initialTab = 'personal',
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<
    'personal' | 'vitals' | 'clinical' | 'emergency' | 'lifestyle'
  >(initialTab);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
  const [gender, setGender] = useState(initialData?.gender || 'male');
  const [bloodGroup, setBloodGroup] = useState(initialData?.bloodGroup || 'Unknown');
  const [height, setHeight] = useState(initialData?.height ? String(initialData.height) : '');
  const [weight, setWeight] = useState(initialData?.weight ? String(initialData.weight) : '');
  const [organDonor, setOrganDonor] = useState(initialData?.organDonor || false);
  const [streetAddress, setStreetAddress] = useState(initialData?.address?.street || '');
  const [city, setCity] = useState(initialData?.address?.city || '');
  const [stateRegion, setStateRegion] = useState(initialData?.address?.state || '');

  // Allergies & tags
  const [allergiesText, setAllergiesText] = useState(initialData?.allergies?.join(', ') || '');
  const [newAllergy, setNewAllergy] = useState('');

  // Chronic diseases & tags
  const [chronicDiseasesText, setChronicDiseasesText] = useState(
    initialData?.chronicDiseases?.join(', ') || ''
  );
  const [newCondition, setNewCondition] = useState('');

  // Current medications & tags
  const [medicationsText, setMedicationsText] = useState(
    initialData?.currentMedications?.join(', ') || ''
  );
  const [newMedication, setNewMedication] = useState('');

  // Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    initialData?.emergencyContacts?.length ? initialData.emergencyContacts : []
  );

  // Insurance
  const [insuranceProvider, setInsuranceProvider] = useState(
    initialData?.insurance?.provider || ''
  );
  const [policyNumber, setPolicyNumber] = useState(initialData?.insurance?.policyNumber || '');

  // Lifestyle
  const [smoking, setSmoking] = useState(initialData?.lifestyle?.smoking || 'never');
  const [alcohol, setAlcohol] = useState(initialData?.lifestyle?.alcohol || 'never');
  const [activityLevel, setActivityLevel] = useState(
    initialData?.lifestyle?.activityLevel || 'moderate'
  );
  const [diet, setDiet] = useState(initialData?.lifestyle?.diet || 'balanced');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setDateOfBirth(initialData.dateOfBirth || '');
      setGender(initialData.gender || 'male');
      setBloodGroup(initialData.bloodGroup || 'Unknown');
      setHeight(initialData.height ? String(initialData.height) : '');
      setWeight(initialData.weight ? String(initialData.weight) : '');
      setOrganDonor(Boolean(initialData.organDonor));
      setStreetAddress(initialData.address?.street || '');
      setCity(initialData.address?.city || '');
      setStateRegion(initialData.address?.state || '');
      setAllergiesText(initialData.allergies?.join(', ') || '');
      setChronicDiseasesText(initialData.chronicDiseases?.join(', ') || '');
      setMedicationsText(initialData.currentMedications?.join(', ') || '');
      setEmergencyContacts(initialData.emergencyContacts || []);
      setInsuranceProvider(initialData.insurance?.provider || '');
      setPolicyNumber(initialData.insurance?.policyNumber || '');
      setSmoking(initialData.lifestyle?.smoking || 'never');
      setAlcohol(initialData.lifestyle?.alcohol || 'never');
      setActivityLevel(initialData.lifestyle?.activityLevel || 'moderate');
      setDiet(initialData.lifestyle?.diet || 'balanced');
    }
  }, [initialData]);

  const handleAddTag = (
    text: string,
    currentCsv: string,
    setter: (val: string) => void,
    clearInput: () => void
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const existing = currentCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!existing.includes(trimmed)) {
      const updated = [...existing, trimmed].join(', ');
      setter(updated);
    }
    clearInput();
  };

  const handleRemoveTag = (tag: string, currentCsv: string, setter: (val: string) => void) => {
    const existing = currentCsv
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s.toLowerCase() !== tag.toLowerCase());
    setter(existing.join(', '));
  };

  const handleAddContact = () => {
    setEmergencyContacts((prev) => [
      ...prev,
      { name: '', relationship: 'Family', phone: '', isPrimary: prev.length === 0 },
    ]);
  };

  const handleRemoveContact = (index: number) => {
    setEmergencyContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateContact = (
    index: number,
    field: keyof EmergencyContact,
    val: string | boolean
  ) => {
    setEmergencyContacts((prev) => {
      const updated = [...prev];
      if (field === 'isPrimary' && val === true) {
        return updated.map((c, i) => ({
          ...c,
          isPrimary: i === index,
        }));
      }
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full legal name is required.';
    }

    if (height) {
      const h = parseFloat(height);
      if (isNaN(h) || h < 20 || h > 300) {
        newErrors.height = 'Height must be between 20 cm and 300 cm.';
      }
    }

    if (weight) {
      const w = parseFloat(weight);
      if (isNaN(w) || w < 2 || w > 500) {
        newErrors.weight = 'Weight must be between 2 kg and 500 kg.';
      }
    }

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (!isNaN(dob.getTime()) && dob > new Date()) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSaving(true);

    const parsedAllergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedChronic = chronicDiseasesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedMeds = medicationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const validContacts = emergencyContacts.filter((c) => c.name.trim() && c.phone.trim());

    const payload: Partial<MedicalProfileData> = {
      fullName: fullName.trim() || 'HealthSphere Patient',
      dateOfBirth,
      gender,
      bloodGroup,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      organDonor,
      allergies: parsedAllergies,
      chronicDiseases: parsedChronic,
      currentMedications: parsedMeds,
      emergencyContacts: validContacts,
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
      address: {
        street: streetAddress.trim(),
        city: city.trim(),
        state: stateRegion.trim(),
      },
    };

    try {
      const success = await onSave(payload);
      if (success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelClick = () => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setDateOfBirth(initialData.dateOfBirth || '');
      setGender(initialData.gender || 'male');
      setBloodGroup(initialData.bloodGroup || 'Unknown');
      setHeight(initialData.height ? String(initialData.height) : '');
      setWeight(initialData.weight ? String(initialData.weight) : '');
      setOrganDonor(Boolean(initialData.organDonor));
      setStreetAddress(initialData.address?.street || '');
      setCity(initialData.address?.city || '');
      setStateRegion(initialData.address?.state || '');
      setAllergiesText(initialData.allergies?.join(', ') || '');
      setChronicDiseasesText(initialData.chronicDiseases?.join(', ') || '');
      setMedicationsText(initialData.currentMedications?.join(', ') || '');
      setEmergencyContacts(initialData.emergencyContacts || []);
      setInsuranceProvider(initialData.insurance?.provider || '');
      setPolicyNumber(initialData.insurance?.policyNumber || '');
      setSmoking(initialData.lifestyle?.smoking || 'never');
      setAlcohol(initialData.lifestyle?.alcohol || 'never');
      setActivityLevel(initialData.lifestyle?.activityLevel || 'moderate');
      setDiet(initialData.lifestyle?.diet || 'balanced');
      setErrors({});
    }
    if (onCancel) {
      onCancel();
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <FileCheck className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm sm:text-base font-extrabold text-slate-900 font-heading">
                Edit Lifelong Medical Profile
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Structured clinical demographic records, emergency dispatch info, and vitals.
            </CardDescription>
          </div>

          {savedSuccess && (
            <span className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Changes Saved Successfully
            </span>
          )}
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 -mb-1 scrollbar-none" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TAB 1: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. Johnathan Doe"
                    className={`rounded-xl text-xs h-9 ${errors.fullName ? 'border-rose-400' : ''}`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-xs font-bold text-slate-700">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                      if (errors.dateOfBirth) setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
                    }}
                    className={`rounded-xl text-xs h-9 ${errors.dateOfBirth ? 'border-rose-400' : ''}`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.dateOfBirth}
                    </p>
                  )}
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

                <div className="space-y-1.5">
                  <Label htmlFor="streetAddress" className="text-xs font-bold text-slate-700">
                    Street Address
                  </Label>
                  <Input
                    id="streetAddress"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. 100 Medical Center Blvd"
                    className="rounded-xl text-xs h-9"
                  />
                </div>
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
                  onChange={(e) => {
                    setHeight(e.target.value);
                    if (errors.height) setErrors((prev) => ({ ...prev, height: '' }));
                  }}
                  placeholder="e.g. 175"
                  className={`rounded-xl text-xs h-9 ${errors.height ? 'border-rose-400' : ''}`}
                />
                {errors.height && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.height}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs font-bold text-slate-700">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    if (errors.weight) setErrors((prev) => ({ ...prev, weight: '' }));
                  }}
                  placeholder="e.g. 70"
                  className={`rounded-xl text-xs h-9 ${errors.weight ? 'border-rose-400' : ''}`}
                />
                {errors.weight && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" /> {errors.weight}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="organDonor"
                  checked={organDonor}
                  onChange={(e) => setOrganDonor(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-600"
                />
                <Label
                  htmlFor="organDonor"
                  className="text-xs font-bold text-slate-800 cursor-pointer"
                >
                  Registered Organ Donor
                </Label>
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL HISTORY */}
          {activeTab === 'clinical' && (
            <div className="space-y-5">
              {/* Allergies */}
              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-xs font-bold text-slate-700">
                  Allergies (comma-separated or add tags)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="newAllergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(newAllergy, allergiesText, setAllergiesText, () =>
                          setNewAllergy('')
                        );
                      }
                    }}
                    placeholder="Type an allergy and press Enter (e.g. Penicillin)"
                    className="rounded-xl text-xs h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAddTag(newAllergy, allergiesText, setAllergiesText, () =>
                        setNewAllergy('')
                      )
                    }
                    className="h-9 px-3 text-xs font-bold rounded-xl"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allergiesText
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(item, allergiesText, setAllergiesText)}
                          className="hover:text-rose-950 p-0.5 rounded cursor-pointer"
                          aria-label={`Remove allergy ${item}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>

                <Input
                  id="allergies"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="Or edit as comma-separated list..."
                  className="rounded-xl text-xs h-8 text-slate-500 bg-slate-50/60"
                />
              </div>

              {/* Chronic Conditions */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <Label htmlFor="chronic" className="text-xs font-bold text-slate-700">
                  Chronic Conditions & Diseases (comma-separated or add tags)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="newCondition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(newCondition, chronicDiseasesText, setChronicDiseasesText, () =>
                          setNewCondition('')
                        );
                      }
                    }}
                    placeholder="Type condition and press Enter (e.g. Asthma)"
                    className="rounded-xl text-xs h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAddTag(newCondition, chronicDiseasesText, setChronicDiseasesText, () =>
                        setNewCondition('')
                      )
                    }
                    className="h-9 px-3 text-xs font-bold rounded-xl"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {chronicDiseasesText
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveTag(item, chronicDiseasesText, setChronicDiseasesText)
                          }
                          className="hover:text-amber-950 p-0.5 rounded cursor-pointer"
                          aria-label={`Remove condition ${item}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>

                <Input
                  id="chronic"
                  value={chronicDiseasesText}
                  onChange={(e) => setChronicDiseasesText(e.target.value)}
                  placeholder="Or edit as comma-separated list..."
                  className="rounded-xl text-xs h-8 text-slate-500 bg-slate-50/60"
                />
              </div>

              {/* Current Medications */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <Label htmlFor="meds" className="text-xs font-bold text-slate-700">
                  Current Medications (comma-separated or add tags)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="newMedication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(newMedication, medicationsText, setMedicationsText, () =>
                          setNewMedication('')
                        );
                      }
                    }}
                    placeholder="Type medication and press Enter (e.g. Montelukast 10mg)"
                    className="rounded-xl text-xs h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleAddTag(newMedication, medicationsText, setMedicationsText, () =>
                        setNewMedication('')
                      )
                    }
                    className="h-9 px-3 text-xs font-bold rounded-xl"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {medicationsText
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(item, medicationsText, setMedicationsText)}
                          className="hover:text-teal-950 p-0.5 rounded cursor-pointer"
                          aria-label={`Remove medication ${item}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>

                <Input
                  id="meds"
                  value={medicationsText}
                  onChange={(e) => setMedicationsText(e.target.value)}
                  placeholder="Or edit as comma-separated list..."
                  className="rounded-xl text-xs h-8 text-slate-500 bg-slate-50/60"
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
                    className="text-xs font-bold h-8 rounded-xl gap-1 border-slate-200 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Contact
                  </Button>
                </div>

                {emergencyContacts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No emergency contacts added yet. Click &quot;Add Contact&quot; above to list
                    trusted relatives or responders.
                  </p>
                ) : (
                  emergencyContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 items-center"
                    >
                      <Input
                        placeholder="Contact Name *"
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
                      <Input
                        placeholder="Phone Number *"
                        value={contact.phone}
                        onChange={(e) => handleUpdateContact(idx, 'phone', e.target.value)}
                        className="rounded-lg text-xs h-8 bg-white"
                      />
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(contact.isPrimary)}
                            onChange={(e) =>
                              handleUpdateContact(idx, 'isPrimary', e.target.checked)
                            }
                            className="rounded text-teal-600"
                          />
                          <span>Primary</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg cursor-pointer transition-colors"
                          title="Delete contact"
                          aria-label={`Delete emergency contact ${contact.name || idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
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

          {/* Form Actions: Save & Cancel */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={handleCancelClick}
              className="rounded-xl text-xs font-bold h-9 px-4 border-slate-200 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-2 h-9 px-5 rounded-xl cursor-pointer shadow-xs transition-all"
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
