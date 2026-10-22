import { memo } from 'react';
import {
  MapPin,
  Calendar,
  Droplet,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Donor } from './DonorCard';

interface DonorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: Donor | null;
  onContact: (donor: Donor) => void;
  contactLoading?: boolean;
}

const maskPhone = (phone?: string) => {
  if (!phone || phone.toLowerCase().includes('contact')) return 'Protected (Dispatch via Platform)';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***-***-****';
  return `(***) ***-${digits.slice(-4)}`;
};

const maskEmail = (email?: string) => {
  if (!email || email.toLowerCase().includes('portal')) return 'Protected (Dispatch via Platform)';
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.***';
  const name = parts[0];
  const domain = parts[1];
  return `${name.slice(0, 1)}***@${domain}`;
};

const bloodGroupColors: Record<string, string> = {
  'A+': 'bg-rose-50 text-rose-800 border-rose-200',
  'A-': 'bg-orange-50 text-orange-800 border-orange-200',
  'B+': 'bg-teal-50 text-teal-800 border-teal-200',
  'B-': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'AB+': 'bg-purple-50 text-purple-800 border-purple-200',
  'AB-': 'bg-pink-50 text-pink-800 border-pink-200',
  'O+': 'bg-teal-50 text-teal-800 border-teal-200',
  'O-': 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export const DonorDrawer = memo(function DonorDrawer({
  open,
  onOpenChange,
  donor,
  onContact,
  contactLoading = false,
}: DonorDrawerProps) {
  if (!donor) return null;

  const isAvailable = donor.availability === 'available';

  const lastDonationDate = donor.lastDonation && !isNaN(new Date(donor.lastDonation).getTime())
    ? new Date(donor.lastDonation)
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md rounded-l-3xl border-slate-200 p-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl font-extrabold text-slate-900 font-heading">
                  {donor.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 mt-1">
                  Consented Voluntary Blood Donor Profile
                </SheetDescription>
              </div>
              <Badge
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {isAvailable ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </SheetHeader>

          {/* Blood Group Highlight Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-lg">
                <Droplet className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Blood Group
                </p>
                <Badge
                  className={`text-sm font-extrabold uppercase mt-0.5 ${
                    bloodGroupColors[donor.bloodGroup] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {donor.bloodGroup || 'Not specified'}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Status
              </p>
              <p className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1 justify-end">
                {isAvailable ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Eligible to Donate</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Unavailable</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Location & Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Location & Verification
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Approximate Region</p>
                  <p className="font-semibold text-slate-800 truncate">
                    {donor.approximateArea || donor.city || 'Regional Health Network'}
                  </p>
                </div>
              </div>

              {lastDonationDate && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Last Recorded Donation</p>
                    <p className="font-semibold text-slate-800">
                      {lastDonationDate.toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {donor.phone && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone (Privacy Masked)</p>
                    <p className="font-semibold text-slate-800 font-mono">{maskPhone(donor.phone)}</p>
                  </div>
                </div>
              )}

              {donor.email && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email (Privacy Masked)</p>
                    <p className="font-semibold text-slate-800 font-mono">{maskEmail(donor.email)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Dispatch Notice */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-teal-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              <Lock className="w-4 h-4 text-teal-800" />
              <span>Donor Privacy Protected</span>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-800/90">
              Personal contact details (phone numbers and home addresses) are strictly confidential under HealthSphere patient privacy policies. Initiating a contact request dispatches a secure platform alert directly to the donor.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={() => onContact(donor)}
              disabled={!isAvailable || contactLoading}
              className="w-full h-10 text-xs font-bold rounded-xl bg-teal-800 hover:bg-teal-900 text-white shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{contactLoading ? 'Dispatching Request...' : 'Send Contact Request'}</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});
