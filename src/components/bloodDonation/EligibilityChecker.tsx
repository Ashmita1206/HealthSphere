import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  evaluateEligibility,
  ELIGIBILITY_DISCLAIMER,
  AGE_OPTIONS,
  WEIGHT_OPTIONS,
} from './eligibilityRules';

export function EligibilityChecker() {
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [hasFever, setHasFever] = useState<string>('');
  const [recentSurgery, setRecentSurgery] = useState<string>('');
  const [pregnancy, setPregnancy] = useState<string>('');
  const [recentDonation, setRecentDonation] = useState<string>('');

  const evaluation = useMemo(() => {
    return evaluateEligibility({
      age,
      weight,
      hasFever,
      recentSurgery,
      pregnancy,
      recentDonation,
    });
  }, [age, weight, hasFever, recentSurgery, pregnancy, recentDonation]);

  const handleReset = () => {
    setAge('');
    setWeight('');
    setHasFever('');
    setRecentSurgery('');
    setPregnancy('');
    setRecentDonation('');
  };

  const getStatusIcon = () => {
    switch (evaluation.status) {
      case 'eligible':
        return CheckCircle2;
      case 'not-eligible':
        return XCircle;
      case 'maybe-eligible':
        return AlertCircle;
      default:
        return HelpCircle;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
      <CardContent className="p-5 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Eligibility Pre-Check
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Clinical Guide
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Preliminary screening questionnaire for voluntary whole blood donors.
          </p>
        </div>

        <div className="space-y-3.5">
          {/* Age selection */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              1. Age Group *
            </Label>
            <Select value={age} onValueChange={setAge}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20">
                <SelectValue placeholder="Select age bracket" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(AGE_OPTIONS).map(([val, item]) => (
                  <SelectItem key={val} value={val} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight selection */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              2. Body Weight *
            </Label>
            <Select value={weight} onValueChange={setWeight}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20">
                <SelectValue placeholder="Select weight bracket" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(WEIGHT_OPTIONS).map(([val, item]) => (
                  <SelectItem key={val} value={val} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fever / infection status */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              3. Current fever, cold, or infection? *
            </Label>
            <Select value={hasFever} onValueChange={setHasFever}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="no" className="text-xs">No - Feeling well and healthy</SelectItem>
                <SelectItem value="yes" className="text-xs">Yes - Active symptoms / illness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Major surgery */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              4. Major surgery in last 6 months? *
            </Label>
            <Select value={recentSurgery} onValueChange={setRecentSurgery}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20">
                <SelectValue placeholder="Select surgery history" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="no" className="text-xs">No major surgeries</SelectItem>
                <SelectItem value="yes" className="text-xs">Yes, within past 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pregnancy */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              5. Are you currently pregnant? *
            </Label>
            <Select value={pregnancy} onValueChange={setPregnancy}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="no" className="text-xs">No / Not applicable</SelectItem>
                <SelectItem value="yes" className="text-xs">Yes</SelectItem>
                <SelectItem value="unsure" className="text-xs">Unsure / Postpartum &lt; 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recent blood donation */}
          <div className="space-y-1">
            <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              6. Donated blood within last 3 months? *
            </Label>
            <Select value={recentDonation} onValueChange={setRecentDonation}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20">
                <SelectValue placeholder="Select donation history" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="no" className="text-xs">No, last donation was 3+ months ago</SelectItem>
                <SelectItem value="yes" className="text-xs">Yes, donated within last 3 months</SelectItem>
                <SelectItem value="unsure" className="text-xs">Unsure of exact date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Evaluation Output Card */}
        <div className={`p-4 rounded-xl border ${evaluation.color} space-y-3 transition-colors`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-current flex items-center justify-center shrink-0 shadow-xs">
              <StatusIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider">
                {evaluation.status === 'incomplete'
                  ? 'Screening Pending'
                  : evaluation.status.replace('-', ' ')}
              </p>
              <p className="text-xs font-bold mt-0.5 leading-snug">{evaluation.message}</p>
            </div>
          </div>

          {evaluation.isComplete && evaluation.reasons.length > 0 && (
            <div className="pt-2 border-t border-current/15 space-y-1 text-[11px] leading-relaxed">
              <span className="font-bold uppercase text-[9px] tracking-wider block opacity-75">
                Key Findings:
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {evaluation.reasons.map((reason, idx) => (
                  <li key={idx} className="font-normal">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.isComplete && (
            <div className="pt-2 border-t border-current/15 text-[11px] leading-relaxed">
              <span className="font-bold uppercase text-[9px] tracking-wider block opacity-75">
                Recommended Next Step:
              </span>
              <p className="font-medium mt-0.5 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                <span>{evaluation.nextSteps}</span>
              </p>
            </div>
          )}
        </div>

        {/* Legal and Clinical Disclaimer */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Clinical Notice: </span>
            <span>{ELIGIBILITY_DISCLAIMER}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="w-full h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Reset Questionnaire
        </Button>
      </CardContent>
    </Card>
  );
}
