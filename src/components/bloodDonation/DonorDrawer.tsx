import { memo } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Droplet, Activity, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { DonationHistory } from './DonationHistory';

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  age: number;
  city: string;
  lastDonation?: string;
  availability: 'available' | 'unavailable';
  distance?: number;
  phone?: string;
  email?: string;
  totalDonations?: number;
  medicalNotes?: string;
  eligibilityStatus?: 'eligible' | 'not-eligible' | 'maybe-eligible';
  donationHistory?: Array<{
    date: string;
    location: string;
    units: number;
  }>;
}

interface DonorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: Donor | null;
  onContact: (donor: Donor) => void;
}

const bloodGroupColors: Record<string, string> = {
  'A+': 'bg-red-50 text-red-700 border-red-200',
  'A-': 'bg-orange-50 text-orange-700 border-orange-200',
  'B+': 'bg-blue-50 text-blue-700 border-blue-200',
  'B-': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'AB+': 'bg-purple-50 text-purple-700 border-purple-200',
  'AB-': 'bg-pink-50 text-pink-700 border-pink-200',
  'O+': 'bg-teal-50 text-teal-700 border-teal-200',
  'O-': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const eligibilityColors: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  eligible: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  'not-eligible': { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle },
  'maybe-eligible': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
};

export const DonorDrawer = memo(function DonorDrawer({
  open,
  onOpenChange,
  donor,
  onContact,
}: DonorDrawerProps) {
  if (!donor) return null;

  const lastDonationDate = donor.lastDonation ? new Date(donor.lastDonation) : null;
  const eligibility = eligibilityColors[donor.eligibilityStatus || 'maybe-eligible'];
  const EligibilityIcon = eligibility.icon;

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
                  Blood Donor Profile
                </SheetDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="shrink-0 h-8 w-8 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* Blood Group Badge */}
          <Badge
            className={`text-sm font-bold uppercase tracking-wider py-2 px-4 ${bloodGroupColors[donor.bloodGroup] || bloodGroupColors['O+']}`}
          >
            {donor.bloodGroup}
          </Badge>

          {/* Personal Details */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Blood Group
                  </p>
                  <p className="text-sm font-bold text-slate-900">{donor.bloodGroup}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Age
                  </p>
                  <p className="text-sm font-bold text-slate-900">{donor.age} years</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-sm font-bold text-slate-900">{donor.city}</p>
                  {donor.distance !== undefined && (
                    <p className="text-xs text-slate-500">{donor.distance} km away</p>
                  )}
                </div>
              </div>

              {donor.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Phone
                    </p>
                    <p className="text-sm font-bold text-slate-900">{donor.phone}</p>
                  </div>
                </div>
              )}

              {donor.email && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm font-bold text-slate-900">{donor.email}</p>
                  </div>
                </div>
              )}

              {lastDonationDate && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Last Donation
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {lastDonationDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Eligibility Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${eligibility.color}`}>
                  <EligibilityIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Eligibility Status
                  </p>
                  <p className="text-sm font-bold text-slate-900 capitalize">
                    {donor.eligibilityStatus?.replace('-', ' ') || 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {donor.medicalNotes && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Medical Notes
                </p>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{donor.medicalNotes}</p>
              </div>
            )}
          </div>

          {/* Donation History */}
          {donor.donationHistory && donor.donationHistory.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Donation History ({donor.donationHistory.length})
              </p>
              <DonationHistory history={donor.donationHistory} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onContact(donor)}
              className="flex-1 h-9 text-xs font-bold rounded-lg"
              disabled={donor.availability !== 'available'}
            >
              <Phone className="h-3.5 w-3.5 mr-1.5" />
              Contact Donor
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs font-bold rounded-lg"
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Send Message
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});
