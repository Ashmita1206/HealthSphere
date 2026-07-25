import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
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

interface EligibilityResult {
  status: 'eligible' | 'not-eligible' | 'maybe-eligible';
  message: string;
  color: string;
  icon: typeof CheckCircle2;
}

export function EligibilityChecker() {
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [hasFever, setHasFever] = useState<string>('');
  const [recentSurgery, setRecentSurgery] = useState<string>('');
  const [pregnancy, setPregnancy] = useState<string>('');
  const [recentDonation, setRecentDonation] = useState<string>('');

  const result = useMemo((): EligibilityResult => {
    if (!age || !weight) {
      return {
        status: 'maybe-eligible',
        message: 'Complete the questionnaire to check eligibility',
        color: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: AlertCircle,
      };
    }

    const ageNum = parseInt(age);
    const weightNum = parseInt(weight);

    // Age check
    if (ageNum < 18 || ageNum > 65) {
      return {
        status: 'not-eligible',
        message: 'Age must be between 18 and 65 years',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      };
    }

    // Weight check
    if (weightNum < 50) {
      return {
        status: 'not-eligible',
        message: 'Weight must be at least 50 kg',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      };
    }

    // Health checks
    if (hasFever === 'yes' || recentSurgery === 'yes') {
      return {
        status: 'not-eligible',
        message: 'Not eligible due to recent health conditions',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      };
    }

    if (pregnancy === 'yes') {
      return {
        status: 'not-eligible',
        message: 'Not eligible during pregnancy',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      };
    }

    if (recentDonation === 'yes') {
      return {
        status: 'not-eligible',
        message: 'Must wait 3 months between donations',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      };
    }

    if (pregnancy === 'unsure' || recentDonation === 'unsure') {
      return {
        status: 'maybe-eligible',
        message: 'Please consult a healthcare provider',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertCircle,
      };
    }

    return {
      status: 'eligible',
      message: 'You are eligible to donate blood',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  }, [age, weight, hasFever, recentSurgery, pregnancy, recentDonation]);

  const ResultIcon = result.icon;

  const handleReset = () => {
    setAge('');
    setWeight('');
    setHasFever('');
    setRecentSurgery('');
    setPregnancy('');
    setRecentDonation('');
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 font-heading">
            Eligibility Checker
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Answer a few questions to check if you can donate blood.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Age
            </Label>
            <Select value={age} onValueChange={setAge}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="18-25">18-25 years</SelectItem>
                <SelectItem value="26-35">26-35 years</SelectItem>
                <SelectItem value="36-45">36-45 years</SelectItem>
                <SelectItem value="46-55">46-55 years</SelectItem>
                <SelectItem value="56-65">56-65 years</SelectItem>
                <SelectItem value="65+">Over 65 years</SelectItem>
                <SelectItem value="under-18">Under 18 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Weight
            </Label>
            <Select value={weight} onValueChange={setWeight}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Select weight range" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="50-60">50-60 kg</SelectItem>
                <SelectItem value="61-70">61-70 kg</SelectItem>
                <SelectItem value="71-80">71-80 kg</SelectItem>
                <SelectItem value="81-90">81-90 kg</SelectItem>
                <SelectItem value="90+">Over 90 kg</SelectItem>
                <SelectItem value="under-50">Under 50 kg</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Do you have fever or infection?
            </Label>
            <Select value={hasFever} onValueChange={setHasFever}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recent surgery (last 6 months)?
            </Label>
            <Select value={recentSurgery} onValueChange={setRecentSurgery}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Are you pregnant?
            </Label>
            <Select value={pregnancy} onValueChange={setPregnancy}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="unsure">Unsure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Donated blood in last 3 months?
            </Label>
            <Select value={recentDonation} onValueChange={setRecentDonation}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="unsure">Unsure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${result.color}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 bg-white">
              <ResultIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider">
                {result.status.replace('-', ' ')}
              </p>
              <p className="text-sm font-bold">{result.message}</p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="w-full h-10 text-xs font-bold rounded-lg"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Reset
        </Button>
      </CardContent>
    </Card>
  );
}
