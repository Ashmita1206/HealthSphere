import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';
import { BMISection } from './BMISection';
import { MedicalTags } from './MedicalTags';

interface MedicalInformationProps {
  height: number;
  weight: number;
  bmi: number;
  allergies?: unknown;
  chronic_diseases?: unknown;
  surgeries?: unknown;
  family_history?: unknown;
  units: string;
  updateProfile: (updates: any) => void;
}

export function MedicalInformation({
  height,
  weight,
  bmi,
  allergies,
  chronic_diseases,
  surgeries,
  family_history,
  units,
  updateProfile,
}: MedicalInformationProps) {
  const safeAllergies = Array.isArray(allergies) ? allergies : [];
  const safeChronicDiseases = Array.isArray(chronic_diseases)
    ? chronic_diseases
    : [];
  const safeSurgeries = Array.isArray(surgeries) ? surgeries : [];
  const safeFamilyHistory = Array.isArray(family_history) ? family_history : [];

  const calculateBMI = (h: number, w: number, u: string): number => {
    if (!h || !w) return 0;
    if (u === 'imperial') {
      const heightInInches = h * 12;
      return (w / (heightInInches * heightInInches)) * 703;
    }
    const heightInMeters = h / 100;
    return w / (heightInMeters * heightInMeters);
  };

  const handleHeightChange = (value: string) => {
    const h = parseFloat(value) || 0;
    const newBMI = calculateBMI(h, weight, units);
    updateProfile({ height: h, bmi: newBMI });
  };

  const handleWeightChange = (value: string) => {
    const w = parseFloat(value) || 0;
    const newBMI = calculateBMI(height, w, units);
    updateProfile({ weight: w, bmi: newBMI });
  };

  const handleUnitsChange = (newUnits: string) => {
    const newBMI = calculateBMI(height, weight, newUnits);
    updateProfile({ units: newUnits, bmi: newBMI });
  };

  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100">
            <FileCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading">Medical Information</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Vitals, conditions, and medical history</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Height, Weight, BMI */}
        <BMISection
          height={height}
          weight={weight}
          bmi={bmi}
          units={units}
          onHeightChange={handleHeightChange}
          onWeightChange={handleWeightChange}
        />

        <div className="h-px bg-slate-100" />

        {/* Medical Tags */}
        <MedicalTags
          label="Allergies"
          tags={safeAllergies}
          placeholder="Add allergy (e.g., Penicillin)"
          color="rose"
          onAdd={(value) => {
            if (
              !safeAllergies.some(
                (tag) =>
                  typeof tag === 'string' &&
                  tag.toLowerCase() === value.toLowerCase(),
              )
            ) {
              updateProfile({ allergies: [...safeAllergies, value] });
            }
          }}
          onRemove={(index) =>
            updateProfile({
              allergies: safeAllergies.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            })
          }
        />

        <MedicalTags
          label="Chronic Diseases"
          tags={safeChronicDiseases}
          placeholder="Add chronic condition (e.g., Diabetes)"
          color="amber"
          onAdd={(value) => {
            if (
              !safeChronicDiseases.some(
                (tag) =>
                  typeof tag === 'string' &&
                  tag.toLowerCase() === value.toLowerCase(),
              )
            ) {
              updateProfile({
                chronic_diseases: [...safeChronicDiseases, value],
              });
            }
          }}
          onRemove={(index) =>
            updateProfile({
              chronic_diseases: safeChronicDiseases.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            })
          }
        />

        <MedicalTags
          label="Surgeries"
          tags={safeSurgeries}
          placeholder="Add surgery (e.g., Appendectomy 2020)"
          color="blue"
          onAdd={(value) => {
            if (
              !safeSurgeries.some(
                (tag) =>
                  typeof tag === 'string' &&
                  tag.toLowerCase() === value.toLowerCase(),
              )
            ) {
              updateProfile({ surgeries: [...safeSurgeries, value] });
            }
          }}
          onRemove={(index) =>
            updateProfile({
              surgeries: safeSurgeries.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            })
          }
        />

        <MedicalTags
          label="Family Medical History"
          tags={safeFamilyHistory}
          placeholder="Add family condition (e.g., Heart disease)"
          color="purple"
          onAdd={(value) => {
            if (
              !safeFamilyHistory.some(
                (tag) =>
                  typeof tag === 'string' &&
                  tag.toLowerCase() === value.toLowerCase(),
              )
            ) {
              updateProfile({ family_history: [...safeFamilyHistory, value] });
            }
          }}
          onRemove={(index) =>
            updateProfile({
              family_history: safeFamilyHistory.filter(
                (_, itemIndex) => itemIndex !== index,
              ),
            })
          }
        />
      </CardContent>
    </Card>
  );
}
