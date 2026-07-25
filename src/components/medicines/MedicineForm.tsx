import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { Pill } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface MedicineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MedicineFormData) => void | Promise<void>;
  loading: boolean;
  editData?: MedicineFormData;
  mode?: 'add' | 'edit' | 'duplicate';
}

export interface MedicineFormData {
  name: string;
  dosage: string;
  strength?: string;
  frequency: string;
  timing?: string;
  remainingPills?: number;
  totalPills?: number;
  startDate?: string;
  endDate?: string;
  doctorName?: string;
  description?: string;
  instructions?: string;
  notes?: string;
}

type ValidatedField =
  | 'name'
  | 'dosage'
  | 'frequency'
  | 'startDate'
  | 'endDate'
  | 'remainingPills'
  | 'totalPills';

export type MedicineFormErrors = Partial<
  Record<ValidatedField, string>
>;

const emptyForm: MedicineFormData = {
  name: '',
  dosage: '',
  strength: '',
  frequency: '',
  timing: '',
  remainingPills: undefined,
  totalPills: undefined,
  startDate: '',
  endDate: '',
  doctorName: '',
  description: '',
  instructions: '',
  notes: '',
};

const createFormState = (
  data?: MedicineFormData,
): MedicineFormData => ({
  ...emptyForm,
  ...data,
  strength: data?.strength ?? '',
  timing: data?.timing ?? '',
  startDate: data?.startDate ?? '',
  endDate: data?.endDate ?? '',
  doctorName: data?.doctorName ?? '',
  description: data?.description ?? '',
  instructions: data?.instructions ?? '',
  notes: data?.notes ?? '',
});

export const validateMedicineForm = (
  form: MedicineFormData,
): MedicineFormErrors => {
  const errors: MedicineFormErrors = {};

  if (!form.name.trim()) errors.name = 'Medicine name is required.';
  if (!form.dosage.trim()) errors.dosage = 'Dosage is required.';
  if (!form.frequency.trim()) errors.frequency = 'Frequency is required.';
  if (!form.startDate) errors.startDate = 'Start date is required.';

  if (
    form.startDate &&
    form.endDate &&
    new Date(`${form.endDate}T00:00:00`).getTime() <
      new Date(`${form.startDate}T00:00:00`).getTime()
  ) {
    errors.endDate = 'End date cannot be before the start date.';
  }

  if (
    form.remainingPills !== undefined &&
    (!Number.isFinite(form.remainingPills) || form.remainingPills < 0)
  ) {
    errors.remainingPills = 'Remaining pills cannot be negative.';
  }

  if (
    form.totalPills === undefined ||
    !Number.isFinite(form.totalPills) ||
    form.totalPills <= 0
  ) {
    errors.totalPills = 'Total pills must be greater than 0.';
  }

  return errors;
};

const parseNumberInput = (value: string): number | undefined => {
  if (value === '') return undefined;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

export function MedicineForm({
  open,
  onOpenChange,
  onSubmit,
  loading,
  editData,
  mode = 'add',
}: MedicineFormProps) {
  const [form, setForm] = useState<MedicineFormData>(emptyForm);
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<ValidatedField, boolean>>
  >({});
  const formId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const errors = useMemo(() => validateMedicineForm(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    if (!open) return;
    setForm(createFormState(editData));
    setTouchedFields({});
  }, [editData, open]);

  const touchField = (field: ValidatedField) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const errorFor = (field: ValidatedField) =>
    touchedFields[field] ? errors[field] : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || loading) return;
    void onSubmit({
      ...form,
      name: form.name.trim(),
      dosage: form.dosage.trim(),
    });
  };

  const dialogTitle =
    mode === 'edit'
      ? 'Edit Medication'
      : mode === 'duplicate'
        ? 'Duplicate Medication'
        : 'Add New Medication';
  const saveLabel =
    mode === 'edit'
      ? 'Update Medication'
      : mode === 'duplicate'
        ? 'Save Copy'
        : 'Save to Cabinet';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg rounded-3xl p-6 border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameInputRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-700" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Complete the required prescription and pill details before saving.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 mt-3"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-name`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Medication Name *
            </Label>
            <Input
              ref={nameInputRef}
              id={`${formId}-name`}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              onBlur={() => touchField('name')}
              placeholder="e.g. Amoxicillin Trihydrate"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              aria-invalid={Boolean(errorFor('name'))}
              aria-describedby={
                errorFor('name') ? `${formId}-name-error` : undefined
              }
              required
            />
            {errorFor('name') && (
              <p
                id={`${formId}-name-error`}
                className="text-[11px] font-medium text-rose-600"
              >
                {errorFor('name')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-dosage`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Dosage Amount *
              </Label>
              <Input
                id={`${formId}-dosage`}
                value={form.dosage}
                onChange={(event) =>
                  setForm({ ...form, dosage: event.target.value })
                }
                onBlur={() => touchField('dosage')}
                placeholder="e.g. 500 mg"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                aria-invalid={Boolean(errorFor('dosage'))}
                aria-describedby={
                  errorFor('dosage') ? `${formId}-dosage-error` : undefined
                }
                required
              />
              {errorFor('dosage') && (
                <p
                  id={`${formId}-dosage-error`}
                  className="text-[11px] font-medium text-rose-600"
                >
                  {errorFor('dosage')}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-strength`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Strength
              </Label>
              <Input
                id={`${formId}-strength`}
                value={form.strength}
                onChange={(event) =>
                  setForm({ ...form, strength: event.target.value })
                }
                placeholder="e.g. Capsule"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Frequency *
              </Label>
              <Select
                value={form.frequency}
                onValueChange={(value) => {
                  setForm({ ...form, frequency: value });
                  touchField('frequency');
                }}
              >
                <SelectTrigger
                  className="h-10 text-xs rounded-xl border-slate-200"
                  aria-label="Frequency"
                  aria-invalid={Boolean(errorFor('frequency'))}
                  aria-describedby={
                    errorFor('frequency')
                      ? `${formId}-frequency-error`
                      : undefined
                  }
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="once-daily">Once Daily</SelectItem>
                  <SelectItem value="twice-daily">Twice Daily</SelectItem>
                  <SelectItem value="three-times-daily">
                    3 Times Daily
                  </SelectItem>
                  <SelectItem value="four-times-daily">
                    4 Times Daily
                  </SelectItem>
                  <SelectItem value="as-needed">As Needed</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {errorFor('frequency') && (
                <p
                  id={`${formId}-frequency-error`}
                  className="text-[11px] font-medium text-rose-600"
                >
                  {errorFor('frequency')}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-timing`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Timing
              </Label>
              <Input
                id={`${formId}-timing`}
                value={form.timing}
                onChange={(event) =>
                  setForm({ ...form, timing: event.target.value })
                }
                placeholder="Morning, Afternoon, Night"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-start-date`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Start Date *
              </Label>
              <Input
                id={`${formId}-start-date`}
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm({ ...form, startDate: event.target.value })
                }
                onBlur={() => touchField('startDate')}
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                aria-invalid={Boolean(errorFor('startDate'))}
                aria-describedby={
                  errorFor('startDate')
                    ? `${formId}-start-date-error`
                    : undefined
                }
                required
              />
              {errorFor('startDate') && (
                <p
                  id={`${formId}-start-date-error`}
                  className="text-[11px] font-medium text-rose-600"
                >
                  {errorFor('startDate')}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-end-date`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                End Date
              </Label>
              <Input
                id={`${formId}-end-date`}
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(event) =>
                  setForm({ ...form, endDate: event.target.value })
                }
                onBlur={() => touchField('endDate')}
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                aria-invalid={Boolean(errorFor('endDate'))}
                aria-describedby={
                  errorFor('endDate')
                    ? `${formId}-end-date-error`
                    : undefined
                }
              />
              {errorFor('endDate') && (
                <p
                  id={`${formId}-end-date-error`}
                  className="text-[11px] font-medium text-rose-600"
                >
                  {errorFor('endDate')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-remaining-pills`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Remaining Pills
              </Label>
              <Input
                id={`${formId}-remaining-pills`}
                type="number"
                min={0}
                step={1}
                value={form.remainingPills ?? ''}
                onChange={(event) =>
                  setForm({
                    ...form,
                    remainingPills: parseNumberInput(event.target.value),
                  })
                }
                onBlur={() => touchField('remainingPills')}
                placeholder="e.g. 30"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                aria-invalid={Boolean(errorFor('remainingPills'))}
                aria-describedby={
                  errorFor('remainingPills')
                    ? `${formId}-remaining-pills-error`
                    : undefined
                }
              />
              {errorFor('remainingPills') && (
                <p
                  id={`${formId}-remaining-pills-error`}
                  className="text-[11px] font-medium text-rose-600"
                >
                  {errorFor('remainingPills')}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`${formId}-total-pills`}
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Total Pills *
              </Label>
              <Input
                id={`${formId}-total-pills`}
                type="number"
                min={1}
                step={1}
                value={form.totalPills ?? ''}
                onChange={(event) =>
                  setForm({
                    ...form,
                    totalPills: parseNumberInput(event.target.value),
                  })
                }
                onBlur={() => touchField('totalPills')}
                placeholder="e.g. 60"
                className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
                aria-invalid={Boolean(errorFor('totalPills'))}
                aria-describedby={
                  errorFor('totalPills')
                    ? `${formId}-total-pills-error`
                    : undefined
                }
                required
              />
              {errorFor('totalPills') && (
                <p
                  id={`${formId}-total-pills-error`}
                  className="text-[11px] font-medium text-rose-600"
                >
                  {errorFor('totalPills')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-doctor-name`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Doctor Name
            </Label>
            <Input
              id={`${formId}-doctor-name`}
              value={form.doctorName}
              onChange={(event) =>
                setForm({ ...form, doctorName: event.target.value })
              }
              placeholder="e.g. Dr. Smith"
              className="h-10 text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-description`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Description
            </Label>
            <Textarea
              id={`${formId}-description`}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="Brief description of the medication"
              className="text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 min-h-[60px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-instructions`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Instructions
            </Label>
            <Textarea
              id={`${formId}-instructions`}
              value={form.instructions}
              onChange={(event) =>
                setForm({ ...form, instructions: event.target.value })
              }
              placeholder="e.g. Take with food, avoid alcohol"
              className="text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 min-h-[60px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`${formId}-notes`}
              className="text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Notes
            </Label>
            <Textarea
              id={`${formId}-notes`}
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
              placeholder="Any additional notes"
              className="text-xs rounded-xl border-slate-200 focus:ring-teal-700/20 focus:border-teal-700 min-h-[60px]"
            />
          </div>

          {!isValid && (
            <p className="text-[11px] text-slate-500" role="status">
              Complete all required fields with valid values to enable Save.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 text-xs font-bold rounded-xl focus-visible:ring-2 focus-visible:ring-teal-600"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              {loading ? 'Saving...' : saveLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
