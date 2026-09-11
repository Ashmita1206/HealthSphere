import React from 'react';
import { ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteria = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial];
  const passedCount = criteria.filter(Boolean).length;

  let strengthLabel = 'Very Weak';
  let barColor = 'bg-rose-500';
  let textColor = 'text-rose-600 dark:text-rose-400';
  let percentage = 20;

  if (passedCount >= 5 && password.length >= 12) {
    strengthLabel = 'Military-Grade';
    barColor = 'bg-emerald-500';
    textColor = 'text-emerald-600 dark:text-emerald-400';
    percentage = 100;
  } else if (passedCount >= 4) {
    strengthLabel = 'Strong';
    barColor = 'bg-teal-500';
    textColor = 'text-teal-600 dark:text-teal-400';
    percentage = 80;
  } else if (passedCount >= 3) {
    strengthLabel = 'Moderate';
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600 dark:text-amber-400';
    percentage = 60;
  } else if (passedCount >= 2) {
    strengthLabel = 'Weak';
    barColor = 'bg-orange-500';
    textColor = 'text-orange-600 dark:text-orange-400';
    percentage = 40;
  }

  return (
    <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          {passedCount >= 4 ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
          Password Strength: <span className={textColor}>{strengthLabel}</span>
        </span>
        <span className="text-xs font-mono text-slate-500">{percentage}%</span>
      </div>

      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1">
          {hasMinLength ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
          Min 8 characters
        </span>
        <span className="flex items-center gap-1">
          {hasUpper && hasLower ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
          Upper & lowercase
        </span>
        <span className="flex items-center gap-1">
          {hasNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
          At least 1 number
        </span>
        <span className="flex items-center gap-1">
          {hasSpecial ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-slate-400" />}
          Special symbol
        </span>
      </div>
    </div>
  );
};
