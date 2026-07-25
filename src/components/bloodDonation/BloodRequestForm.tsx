import { useState, useEffect, useId, useMemo } from 'react';
import { Droplet } from 'lucide-react';
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
  patientName: string;
  bloodGroup: string;
  hospital: string;
  unitsRequired: number;
  requiredDate: string;
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

const emptyForm: BloodRequestFormData = {
  patientName: '',
  bloodGroup: '',
  hospital: '',
  unitsRequired: 1,
  requiredDate: '',
  contactNumber: '',
  notes: '',
};

const createFormState = (data?: BloodRequestFormData): BloodRequestFormData => ({
  ...emptyForm,
  ...data,
});

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
    if (!form.patientName.trim()) errs.patientName = 'Patient name is required';
    if (!form.bloodGroup) errs.bloodGroup = 'Blood group is required';
    if (!form.hospital.trim()) errs.hospital = 'Hospital name is required';
    if (!form.unitsRequired || form.unitsRequired < 1) errs.unitsRequired = 'Units must be at least 1';
    if (!form.requiredDate) errs.requiredDate = 'Required date is required';
    else {
      const date = new Date(form.requiredDate);
      if (date < new Date()) errs.requiredDate = 'Date must be in the future';
    }
    if (!form.contactNumber.trim()) errs.contactNumber = 'Contact number is required';
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
      contactNumber: form.contactNumber.trim(),
    });
  };

  const dialogTitle = mode === 'edit' ? 'Edit Blood Request' : 'Request Blood';
  const saveLabel = mode === 'edit' ? 'Update Request' : 'Submit Request';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-700" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Complete the details to request blood donation.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-3" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-patient`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Patient Name *
            </Label>
            <Input
              id={`${formId}-patient`}
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              placeholder="e.g. John Doe"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-rose-700/20 focus:border-rose-700"
              aria-invalid={Boolean(errors.patientName)}
              required
            />
            {errors.patientName && (
              <p className="text-[11px] font-medium text-rose-600">{errors.patientName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-blood`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Blood Group *
            </Label>
            <Select value={form.bloodGroup} onValueChange={(value) => setForm({ ...form, bloodGroup: value })}>
              <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bloodGroup && (
              <p className="text-[11px] font-medium text-rose-600">{errors.bloodGroup}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-hospital`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Hospital / Clinic *
            </Label>
            <Input
              id={`${formId}-hospital`}
              value={form.hospital}
              onChange={(e) => setForm({ ...form, hospital: e.target.value })}
              placeholder="e.g. HealthSphere Central Hospital"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-rose-700/20 focus:border-rose-700"
              aria-invalid={Boolean(errors.hospital)}
              required
            />
            {errors.hospital && (
              <p className="text-[11px] font-medium text-rose-600">{errors.hospital}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-units`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Units Required *
              </Label>
              <Input
                id={`${formId}-units`}
                type="number"
                min="1"
                value={form.unitsRequired}
                onChange={(e) => setForm({ ...form, unitsRequired: parseInt(e.target.value) || 1 })}
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-rose-700/20 focus:border-rose-700"
                aria-invalid={Boolean(errors.unitsRequired)}
                required
              />
              {errors.unitsRequired && (
                <p className="text-[11px] font-medium text-rose-600">{errors.unitsRequired}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-date`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Required Date *
              </Label>
              <Input
                id={`${formId}-date`}
                type="date"
                value={form.requiredDate}
                onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
                className="h-10 text-xs rounded-xl border-slate-200"
                aria-invalid={Boolean(errors.requiredDate)}
                required
              />
              {errors.requiredDate && (
                <p className="text-[11px] font-medium text-rose-600">{errors.requiredDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-contact`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Contact Number *
            </Label>
            <Input
              id={`${formId}-contact`}
              type="tel"
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              placeholder="e.g. +1 234 567 8900"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-rose-700/20 focus:border-rose-700"
              aria-invalid={Boolean(errors.contactNumber)}
              required
            />
            {errors.contactNumber && (
              <p className="text-[11px] font-medium text-rose-600">{errors.contactNumber}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-notes`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Additional Notes
            </Label>
            <Textarea
              id={`${formId}-notes`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional information"
              className="text-xs rounded-xl border-slate-200 focus:ring-rose-700/20 focus:border-rose-700 min-h-[60px]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 text-xs font-bold rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 h-11 bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm rounded-xl shadow-md"
            >
              {loading ? 'Submitting...' : saveLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
