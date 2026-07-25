import { useState, useEffect, useId, useMemo, useRef } from 'react';
import { Stethoscope } from 'lucide-react';
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

export interface AppointmentFormData {
  doctor_name: string;
  specialty: string;
  hospital: string;
  appointment_date: string;
  purpose: string;
  notes: string;
}

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AppointmentFormData) => void | Promise<void>;
  loading: boolean;
  editData?: AppointmentFormData;
  mode?: 'add' | 'edit';
}

const emptyForm: AppointmentFormData = {
  doctor_name: '',
  specialty: '',
  hospital: '',
  appointment_date: '',
  purpose: '',
  notes: '',
};

const createFormState = (data?: AppointmentFormData): AppointmentFormData => ({
  ...emptyForm,
  ...data,
});

export function AppointmentForm({
  open,
  onOpenChange,
  onSubmit,
  loading,
  editData,
  mode = 'add',
}: AppointmentFormProps) {
  const [form, setForm] = useState<AppointmentFormData>(emptyForm);
  const formId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!form.doctor_name.trim()) errs.doctor_name = 'Doctor name is required';
    if (!form.appointment_date) errs.appointment_date = 'Appointment date is required';
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
      doctor_name: form.doctor_name.trim(),
    });
  };

  const dialogTitle = mode === 'edit' ? 'Edit Appointment' : 'Book Doctor Consultation';
  const saveLabel = mode === 'edit' ? 'Update Appointment' : 'Confirm & Save Appointment';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-700" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Complete the appointment details to book your consultation.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-3" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-doctor`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Physician / Doctor Name *
            </Label>
            <Input
              ref={nameInputRef}
              id={`${formId}-doctor`}
              value={form.doctor_name}
              onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
              placeholder="e.g. Dr. Sarah Jenkins"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              aria-invalid={Boolean(errors.doctor_name)}
              aria-describedby={errors.doctor_name ? `${formId}-doctor-error` : undefined}
              required
            />
            {errors.doctor_name && (
              <p
                id={`${formId}-doctor-error`}
                className="text-[11px] font-medium text-rose-600"
                role="alert"
              >
                {errors.doctor_name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-specialty`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Medical Specialty
            </Label>
            <Select value={form.specialty} onValueChange={(value) => setForm({ ...form, specialty: value })}>
              <SelectTrigger
                id={`${formId}-specialty`}
                className="h-10 text-xs rounded-xl border-slate-200"
                aria-label="Medical specialty"
              >
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="general">General Practice</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                <SelectItem value="orthopedics">Orthopedics</SelectItem>
                <SelectItem value="dermatology">Dermatology</SelectItem>
                <SelectItem value="gynecology">Gynecology</SelectItem>
                <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                <SelectItem value="ent">ENT</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-hospital`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Hospital / Clinic
            </Label>
            <Input
              id={`${formId}-hospital`}
              value={form.hospital}
              onChange={(e) => setForm({ ...form, hospital: e.target.value })}
              placeholder="e.g. HealthSphere Central Hospital"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-date`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Appointment Date & Time *
            </Label>
            <Input
              id={`${formId}-date`}
              type="datetime-local"
              value={form.appointment_date}
              onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              className="h-10 text-xs rounded-xl border-slate-200"
              aria-invalid={Boolean(errors.appointment_date)}
              aria-describedby={errors.appointment_date ? `${formId}-date-error` : undefined}
              required
            />
            {errors.appointment_date && (
              <p
                id={`${formId}-date-error`}
                className="text-[11px] font-medium text-rose-600"
                role="alert"
              >
                {errors.appointment_date}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-purpose`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Purpose of Visit
            </Label>
            <Input
              id={`${formId}-purpose`}
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              placeholder="e.g. Annual checkup, Follow-up"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
            />
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
              className="text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 min-h-[60px]"
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
              className="flex-1 h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md"
            >
              {loading ? 'Saving...' : saveLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
