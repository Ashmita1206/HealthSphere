import { useState, useEffect, useId, useMemo } from 'react';
import { Droplet, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface BloodRequestFormData {
  id?: string;
  patientName: string;
  bloodGroup: string;
  componentType: 'whole_blood' | 'prbc' | 'platelets' | 'ffp' | 'cryo';
  hospital: string;
  approximateArea: string;
  unitsRequired: number;
  requiredDate: string;
  urgency: 'critical' | 'high' | 'normal';
  contactNumber: string;
  notes: string;
}

interface BloodRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BloodRequestFormData) => void | Promise<void>;
  loading: boolean;
  editData?: BloodRequestFormData;
  mode?: 'add' | 'edit';
}

const getDefaultRequiredDate = () => {
  const d = new Date(Date.now() + 48 * 3600 * 1000);
  return d.toISOString().split('T')[0];
};

const emptyForm: BloodRequestFormData = {
  patientName: '',
  bloodGroup: 'O+',
  componentType: 'whole_blood',
  hospital: '',
  approximateArea: '',
  unitsRequired: 1,
  requiredDate: getDefaultRequiredDate(),
  urgency: 'normal',
  contactNumber: '',
  notes: '',
};

const createFormState = (data?: BloodRequestFormData): BloodRequestFormData => ({
  ...emptyForm,
  ...data,
  requiredDate: data?.requiredDate
    ? data.requiredDate.includes('T')
      ? data.requiredDate.split('T')[0]
      : data.requiredDate
    : getDefaultRequiredDate(),
});

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const componentOptions = [
  { value: 'whole_blood', label: 'Whole Blood' },
  { value: 'prbc', label: 'Packed Red Blood Cells (PRBC)' },
  { value: 'platelets', label: 'Platelets (RDP / SDP)' },
  { value: 'ffp', label: 'Fresh Frozen Plasma (FFP)' },
  { value: 'cryo', label: 'Cryoprecipitate' },
];

export function BloodRequestForm({
  open,
  onOpenChange,
  onSubmit,
  loading,
  editData,
  mode = 'add',
}: BloodRequestFormProps) {
  const [form, setForm] = useState<BloodRequestFormData>(emptyForm);
  const formId = useId();

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!form.patientName.trim()) errs.patientName = 'Patient or recipient name is required';
    if (!form.bloodGroup) errs.bloodGroup = 'Blood group is required';
    if (!form.hospital.trim()) errs.hospital = 'Hospital / facility name is required';
    if (!form.unitsRequired || form.unitsRequired < 1) errs.unitsRequired = 'Units required must be at least 1';
    if (!form.requiredDate) {
      errs.requiredDate = 'Required-by date is required';
    } else {
      const selected = new Date(form.requiredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errs.requiredDate = 'Date cannot be in the past';
      }
    }
    return errs;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (!open) return;
    setForm(createFormState(editData));
  }, [editData, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || loading) return;

    await onSubmit({
      ...form,
      patientName: form.patientName.trim(),
      hospital: form.hospital.trim(),
      approximateArea: form.approximateArea.trim(),
      contactNumber: form.contactNumber.trim(),
      notes: form.notes.trim(),
      requiredDate: new Date(form.requiredDate).toISOString(),
    });
  };

  const dialogTitle = mode === 'edit' ? 'Edit Blood Request' : 'Create Blood Request';
  const saveLabel = mode === 'edit' ? 'Update Request' : 'Publish Request';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-6 border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-700" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Submit a verified clinical blood requirement to notify matched donors and partner facilities.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-3" onSubmit={handleSubmit} noValidate>
          {/* Patient name & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label
                htmlFor={`${formId}-patient`}
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                Patient / Recipient Name *
              </Label>
              <Input
                id={`${formId}-patient`}
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                placeholder="e.g. John Doe"
                className="h-9 text-xs rounded-xl border-slate-200 focus:ring-rose-700/20 focus:border-rose-700"
                aria-invalid={Boolean(errors.patientName)}
                required
              />
              {errors.patientName && (
                <p className="text-[10px] font-medium text-rose-600">{errors.patientName}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor={`${formId}-blood`}
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                Blood Group *
              </Label>
              <Select
                value={form.bloodGroup}
                onValueChange={(value) => setForm({ ...form, bloodGroup: value })}
              >
                <SelectTrigger id={`${formId}-blood`} className="h-9 text-xs rounded-xl border-slate-200">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group} className="text-xs font-bold">
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Component Type & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label
                htmlFor={`${formId}-component`}
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                Blood Component *
              </Label>
              <Select
                value={form.componentType}
                onValueChange={(value: any) => setForm({ ...form, componentType: value })}
              >
                <SelectTrigger id={`${formId}-component`} className="h-9 text-xs rounded-xl border-slate-200">
                  <SelectValue placeholder="Select component" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {componentOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor={`${formId}-units`}
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                Units Required *
              </Label>
              <Input
                id={`${formId}-units`}
                type="number"
                min={1}
                max={20}
                value={form.unitsRequired}
                onChange={(e) =>
                  setForm({ ...form, unitsRequired: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="h-9 text-xs rounded-xl border-slate-200"
                required
              />
              {errors.unitsRequired && (
                <p className="text-[10px] font-medium text-rose-600">{errors.unitsRequired}</p>
              )}
            </div>
          </div>

          {/* Hospital & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label
                htmlFor={`${formId}-hospital`}
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                Hospital / Facility *
              </Label>
              <Input
                id={`${formId}-hospital`}
                value={form.hospital}
                onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                placeholder="e.g. City General Hospital"
                className="h-9 text-xs rounded-xl border-slate-200 focus:ring-rose-700/20"
                required
              />
              {errors.hospital && (
                <p className="text-[10px] font-medium text-rose-600">{errors.hospital}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor={`${formId}-area`}
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                Approximate Area / City
              </Label>
              <Input
                id={`${formId}-area`}
                value={form.approximateArea}
                onChange={(e) => setForm({ ...form, approximateArea: e.target.value })}
                placeholder="e.g. South Sector, Mumbai"
                className="h-9 text-xs rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Required Date & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label
                htmlFor={`${formId}-date`}
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                Required By Date *
              </Label>
              <Input
                id={`${formId}-date`}
                type="date"
                value={form.requiredDate}
                onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
                className="h-9 text-xs rounded-xl border-slate-200 focus:ring-rose-700/20"
                required
              />
              {errors.requiredDate && (
                <p className="text-[10px] font-medium text-rose-600">{errors.requiredDate}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor={`${formId}-urgency`}
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
              >
                Clinical Urgency Level *
              </Label>
              <Select
                value={form.urgency}
                onValueChange={(value: any) => setForm({ ...form, urgency: value })}
              >
                <SelectTrigger id={`${formId}-urgency`} className="h-9 text-xs rounded-xl border-slate-200">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="critical" className="text-xs text-rose-700 font-bold">
                    Critical (Immediate Transfusion / Surgery)
                  </SelectItem>
                  <SelectItem value="high" className="text-xs text-orange-700 font-medium">
                    High Priority (Within 24 Hours)
                  </SelectItem>
                  <SelectItem value="normal" className="text-xs text-slate-700">
                    Normal Priority (Planned Schedule)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact phone */}
          <div className="space-y-1">
            <Label
              htmlFor={`${formId}-phone`}
              className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
            >
              Coordinator / Attendant Phone
            </Label>
            <Input
              id={`${formId}-phone`}
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="h-9 text-xs rounded-xl border-slate-200"
            />
            <p className="text-[10px] text-slate-400">
              Only verified medical staff and authorized donors dispatched by the platform can view contact info.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label
              htmlFor={`${formId}-notes`}
              className="text-[11px] font-bold text-slate-700 uppercase tracking-wider"
            >
              Clinical Notes / Ward Information
            </Label>
            <Textarea
              id={`${formId}-notes`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Specify ward, ICU bed, physician reference, or replacement requirements..."
              rows={2}
              className="text-xs rounded-xl border-slate-200 focus:ring-rose-700/20"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-600 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
            <span>HealthSphere records timestamps and audits all requests to prevent duplicate solicitations.</span>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs font-bold rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || loading}
              className="h-9 text-xs font-bold rounded-xl bg-rose-700 hover:bg-rose-800 text-white shadow-sm flex items-center gap-2"
            >
              {loading && <AlertTriangle className="h-3.5 w-3.5 animate-spin" />}
              <span>{saveLabel}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
