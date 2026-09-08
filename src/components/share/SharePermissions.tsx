import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  User,
  Pill,
  Calendar,
  FileText,
  History,
  Activity,
  AlertTriangle,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import type { SharePermissions as PermissionsType } from '@/services/shareService';

interface SharePermissionsProps {
  permissions: PermissionsType;
  onChange: (permissions: PermissionsType) => void;
  disabled?: boolean;
}

interface PermissionConfig {
  key: keyof PermissionsType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const PERMISSION_CONFIGS: PermissionConfig[] = [
  {
    key: 'profile',
    label: 'Medical Profile',
    description: 'Demographics, blood group, chronic conditions, and general health identity',
    icon: User,
    accentColor: 'text-teal-700 bg-teal-50',
  },
  {
    key: 'medicines',
    label: 'Medications',
    description: 'Active prescriptions, dosages, schedules, and adherence track record',
    icon: Pill,
    accentColor: 'text-blue-700 bg-blue-50',
  },
  {
    key: 'appointments',
    label: 'Appointments',
    description: 'Upcoming consultations, clinical history, and department bookings',
    icon: Calendar,
    accentColor: 'text-purple-700 bg-purple-50',
  },
  {
    key: 'reports',
    label: 'Medical Reports',
    description: 'Lab test results, diagnostic biomarkers, pathology findings, and OCR data',
    icon: FileText,
    accentColor: 'text-amber-700 bg-amber-50',
  },
  {
    key: 'timeline',
    label: 'Health Timeline',
    description: 'Chronological clinical care journey, doctor visits, and patient milestones',
    icon: History,
    accentColor: 'text-indigo-700 bg-indigo-50',
  },
  {
    key: 'analytics',
    label: 'Smart Analytics',
    description: 'Holistic AI Health Score, vital trend telemetry, and risk evaluations',
    icon: Activity,
    accentColor: 'text-emerald-700 bg-emerald-50',
  },
  {
    key: 'emergency',
    label: 'Emergency Information',
    description: 'Allergies, emergency contacts, primary next-of-kin, and donor status',
    icon: AlertTriangle,
    accentColor: 'text-red-700 bg-red-50',
  },
];

export const SharePermissions: React.FC<SharePermissionsProps> = ({
  permissions,
  onChange,
  disabled = false,
}) => {
  const handleToggle = (key: keyof PermissionsType) => {
    if (disabled) return;
    onChange({
      ...permissions,
      [key]: !permissions[key],
    });
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange({
      profile: true,
      reports: true,
      medicines: true,
      appointments: true,
      timeline: true,
      analytics: true,
      emergency: true,
    });
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onChange({
      profile: false,
      reports: false,
      medicines: false,
      appointments: false,
      timeline: false,
      analytics: false,
      emergency: false,
    });
  };

  const selectedCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Access Permissions
          </span>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
            {selectedCount} of 7 Selected
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled}
            className="h-7 px-2 text-[11px] font-semibold text-teal-800 hover:text-teal-900 hover:bg-teal-50 gap-1"
          >
            <CheckCheck className="w-3 h-3" />
            <span>Select All</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDeselectAll}
            disabled={disabled}
            className="h-7 px-2 text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* Granular permission checkboxes */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {PERMISSION_CONFIGS.map((config) => {
          const isChecked = Boolean(permissions[config.key]);
          const Icon = config.icon;

          return (
            <div
              key={config.key}
              onClick={() => handleToggle(config.key)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                isChecked
                  ? 'bg-teal-50/40 border-teal-300/80 shadow-2xs'
                  : 'bg-white border-slate-200/70 hover:border-slate-300 opacity-80'
              } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div className="pt-0.5">
                <Checkbox
                  id={`perm-${config.key}`}
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(config.key)}
                  disabled={disabled}
                  className="data-[state=checked]:bg-teal-800 data-[state=checked]:border-teal-800"
                />
              </div>

              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${config.accentColor}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`perm-${config.key}`}
                  className="text-xs font-bold text-slate-900 block cursor-pointer"
                >
                  {config.label}
                </Label>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {config.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
