import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Ruler, Scale, Activity } from 'lucide-react';

interface BMISectionProps {
  height: number;
  weight: number;
  bmi: number;
  units: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
}

export function BMISection({
  height,
  weight,
  bmi,
  units,
  onHeightChange,
  onWeightChange,
}: BMISectionProps) {
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (bmi < 25) return { label: 'Normal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (bmi < 30) return { label: 'Overweight', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Obese', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const category = getBMICategory(bmi);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Ruler className="h-3.5 w-3.5 text-blue-700" />
          Height ({units === 'metric' ? 'cm' : 'ft'})
        </Label>
        <Input
          type="number"
          value={height || ''}
          onChange={(e) => onHeightChange(e.target.value)}
          placeholder={units === 'metric' ? '175' : '5.9'}
          className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
          aria-label="Height"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Scale className="h-3.5 w-3.5 text-blue-700" />
          Weight ({units === 'metric' ? 'kg' : 'lbs'})
        </Label>
        <Input
          type="number"
          value={weight || ''}
          onChange={(e) => onWeightChange(e.target.value)}
          placeholder={units === 'metric' ? '70' : '154'}
          className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
          aria-label="Weight"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-blue-700" />
          BMI (Auto-calculated)
        </Label>
        <div className="flex items-center gap-2">
          <div className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center text-xs font-bold text-slate-900 flex-1">
            {bmi ? bmi.toFixed(1) : '--'}
          </div>
          {bmi > 0 && (
            <Badge className={`text-[10px] font-bold px-2 py-1 rounded-full ${category.color}`}>
              {category.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
