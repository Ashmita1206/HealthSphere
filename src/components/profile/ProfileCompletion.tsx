import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Profile {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  height: number;
  weight: number;
  allergies: string[];
  chronic_diseases: string[];
  surgeries: string[];
  family_history: string[];
  smoking: string;
  alcohol: string;
  exercise_level: string;
  sleep_hours: number;
  diet_preference: string;
  language: string;
  units: string;
}

interface ProfileCompletionProps {
  profile: Profile;
}

export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const safeAllergies = Array.isArray(profile.allergies)
    ? profile.allergies
    : [];
  const safeChronicDiseases = Array.isArray(profile.chronic_diseases)
    ? profile.chronic_diseases
    : [];
  const safeSurgeries = Array.isArray(profile.surgeries)
    ? profile.surgeries
    : [];
  const safeFamilyHistory = Array.isArray(profile.family_history)
    ? profile.family_history
    : [];

  const sections = [
    {
      name: 'Personal Info',
      fields: ['full_name', 'phone', 'date_of_birth', 'gender', 'blood_type', 'address'],
      weight: 30,
    },
    {
      name: 'Medical Info',
      fields: ['height', 'weight'],
      weight: 30,
    },
    {
      name: 'Emergency Contact',
      fields: ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'],
      weight: 15,
    },
    {
      name: 'Lifestyle',
      fields: ['smoking', 'alcohol', 'exercise_level', 'sleep_hours', 'diet_preference'],
      weight: 15,
    },
    {
      name: 'Preferences',
      fields: ['language', 'units'],
      weight: 10,
    },
  ];

  const calculateCompletion = () => {
    let totalWeight = 0;
    let completedWeight = 0;

    sections.forEach((section) => {
      const sectionFields = section.fields.length;
      const completedInSection = section.fields.filter((field) => {
        const value = (profile as any)[field];
        return value !== undefined && value !== null && value !== '' && value !== 0;
      }).length;

      const sectionCompletion = completedInSection / sectionFields;
      completedWeight += sectionCompletion * section.weight;
      totalWeight += section.weight;
    });

    // Bonus for medical tags (adds up to 5% extra)
    let tagBonus = 0;
    if (safeAllergies.length > 0) tagBonus += 1.25;
    if (safeChronicDiseases.length > 0) tagBonus += 1.25;
    if (safeSurgeries.length > 0) tagBonus += 1.25;
    if (safeFamilyHistory.length > 0) tagBonus += 1.25;

    const baseCompletion = (completedWeight / totalWeight) * 100;
    return Math.min(Math.round(baseCompletion + tagBonus), 100);
  };

  const completion = calculateCompletion();
  const missingSections = sections.filter((section) => {
    const hasData = section.fields.some((field) => {
      const value = (profile as any)[field];
      return value !== undefined && value !== null && value !== '' && value !== 0;
    });
    return !hasData;
  });

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-base font-extrabold text-slate-900 font-heading">
          Profile Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {completion >= 80 ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <span className="text-3xl font-extrabold font-heading text-slate-900">
                {completion}%
              </span>
              <p className="text-xs text-slate-500 font-normal">Complete</p>
            </div>
          </div>
          <div className="text-right">
            <Progress value={completion} className="w-32 h-2" />
          </div>
        </div>

        {missingSections.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-700 mb-2">Missing Information:</p>
            <div className="flex flex-wrap gap-2">
              {missingSections.map((section) => (
                <span
                  key={section.name}
                  className="text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                >
                  {section.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
