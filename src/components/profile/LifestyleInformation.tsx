import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Zap, Dumbbell, Moon, Utensils } from 'lucide-react';

interface LifestyleInformationProps {
  smoking: string;
  alcohol: string;
  exercise_level: string;
  sleep_hours: number;
  diet_preference: string;
  updateProfile: (updates: any) => void;
}

export function LifestyleInformation({
  smoking,
  alcohol,
  exercise_level,
  sleep_hours,
  diet_preference,
  updateProfile,
}: LifestyleInformationProps) {
  return (
    <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold border border-green-100">
            <Zap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading">Lifestyle Information</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Habits and daily routines</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Smoking</Label>
            <Select
              value={smoking || ''}
              onValueChange={(v) => updateProfile({ smoking: v })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200" aria-label="Smoking status">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="former">Former Smoker</SelectItem>
                <SelectItem value="occasional">Occasional</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alcohol Consumption</Label>
            <Select
              value={alcohol || ''}
              onValueChange={(v) => updateProfile({ alcohol: v })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200" aria-label="Alcohol consumption">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="occasional">Occasional</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 text-green-700" />
              Exercise Level
            </Label>
            <Select
              value={exercise_level || ''}
              onValueChange={(v) => updateProfile({ exercise_level: v })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200" aria-label="Exercise level">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Light (1-2 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (3-4 days/week)</SelectItem>
                <SelectItem value="active">Active (5+ days/week)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-green-700" />
              Sleep Hours (daily)
            </Label>
            <Input
              type="number"
              value={sleep_hours || ''}
              onChange={(e) => updateProfile({ sleep_hours: parseFloat(e.target.value) || 8 })}
              placeholder="8"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              aria-label="Sleep hours"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-green-700" />
              Diet Preference
            </Label>
            <Select
              value={diet_preference || ''}
              onValueChange={(v) => updateProfile({ diet_preference: v })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200" aria-label="Diet preference">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="omnivore">Omnivore</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
