import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PhoneCall,
  ShieldCheck,
  HeartHandshake,
  Stethoscope,
  Building2,
  AlertTriangle,
  Save,
  Check,
} from 'lucide-react';
import type { Profile } from '@/pages/profile/profileData';

interface EmergencyContactProps {
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  organ_donor?: boolean;
  primary_physician?: string;
  preferred_hospital?: string;
  updateProfile: (updates: Partial<Profile>) => void;
  onSave?: () => Promise<boolean> | Promise<void> | boolean | void;
  saving?: boolean;
}

export function EmergencyContact({
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  insurance_provider,
  insurance_policy_number,
  organ_donor = true,
  primary_physician,
  preferred_hospital,
  updateProfile,
  onSave,
  saving = false,
}: EmergencyContactProps) {
  const [localSaved, setLocalSaved] = useState(false);

  const handleSaveClick = async () => {
    if (onSave) {
      const ok = await onSave();
      if (ok !== false) {
        setLocalSaved(true);
        setTimeout(() => setLocalSaved(false), 3000);
      }
    }
  };

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs bg-white">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900">
                Emergency & Insurance Profile
              </h3>
              <p className="text-xs text-slate-500">
                Critical medical contact data accessible during emergency response.
              </p>
            </div>
          </div>
          <Badge className="bg-rose-50 text-rose-800 border-rose-200 text-[10px] font-bold uppercase tracking-wider">
            Triage Ready
          </Badge>
        </div>

        {/* Emergency Contact Inputs */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 m-0">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Primary Emergency Contact</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact_name" className="text-xs font-semibold text-slate-700">
                Contact Name
              </Label>
              <Input
                id="emergency_contact_name"
                value={emergency_contact_name}
                onChange={(e) => updateProfile({ emergency_contact_name: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact_phone" className="text-xs font-semibold text-slate-700">
                Contact Phone
              </Label>
              <Input
                id="emergency_contact_phone"
                value={emergency_contact_phone}
                onChange={(e) => updateProfile({ emergency_contact_phone: e.target.value })}
                placeholder="e.g. +1 (555) 234-5678"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact_relationship" className="text-xs font-semibold text-slate-700">
                Relationship
              </Label>
              <Input
                id="emergency_contact_relationship"
                value={emergency_contact_relationship}
                onChange={(e) => updateProfile({ emergency_contact_relationship: e.target.value })}
                placeholder="e.g. Spouse / Sibling / Parent"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 m-0">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
            <span>Health Insurance Coverage</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="insurance_provider" className="text-xs font-semibold text-slate-700">
                Insurance Provider Name
              </Label>
              <Input
                id="insurance_provider"
                value={insurance_provider ?? ''}
                onChange={(e) => updateProfile({ insurance_provider: e.target.value })}
                placeholder="e.g. CareHealth Premier Gold"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="insurance_policy_number" className="text-xs font-semibold text-slate-700">
                Policy / Member ID Number
              </Label>
              <Input
                id="insurance_policy_number"
                value={insurance_policy_number ?? ''}
                onChange={(e) => updateProfile({ insurance_policy_number: e.target.value })}
                placeholder="e.g. CH-98745210"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Primary Physician & Preferred Hospital & Organ Donor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="primary_physician" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Stethoscope className="h-3.5 w-3.5 text-teal-700" />
              <span>Primary Physician</span>
            </Label>
            <Input
              id="primary_physician"
              value={primary_physician ?? ''}
              onChange={(e) => updateProfile({ primary_physician: e.target.value })}
              placeholder="e.g. Dr. Vikram Malhotra"
              className="h-10 text-xs rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preferred_hospital" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-teal-700" />
              <span>Preferred Emergency Hospital</span>
            </Label>
            <Input
              id="preferred_hospital"
              value={preferred_hospital ?? ''}
              onChange={(e) => updateProfile({ preferred_hospital: e.target.value })}
              placeholder="e.g. HealthSphere Specialty Hospital"
              className="h-10 text-xs rounded-xl border-slate-200"
            />
          </div>

          {/* Organ Donor Toggle Card */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                <span>Organ Donor Status</span>
              </span>
              <p className="text-[11px] text-emerald-800">Pledged for organ donation registry</p>
            </div>
            <Switch
              checked={organ_donor}
              onCheckedChange={(checked) => updateProfile({ organ_donor: checked })}
              aria-label="Organ donor status"
            />
          </div>
        </div>

        {/* Save Emergency Info Action */}
        {onSave && (
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {localSaved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Emergency Contacts Saved
              </span>
            )}
            <Button
              type="button"
              onClick={handleSaveClick}
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold h-9 px-4 gap-1.5 shadow-xs cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Emergency Info'}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
