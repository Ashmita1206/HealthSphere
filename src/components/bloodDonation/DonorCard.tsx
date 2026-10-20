import { memo } from 'react';
import { motion } from 'framer-motion';
import { Droplet, MapPin, Calendar, CheckCircle2, Clock, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  city?: string;
  approximateArea?: string;
  lastDonation?: string;
  availability: 'available' | 'unavailable';
  distance?: number;
  contactPreference?: string;
  totalDonations?: number;
}

interface DonorCardProps {
  donor: Donor;
  index: number;
  onContact: (donor: Donor) => void;
  onClick: (donor: Donor) => void;
}

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

export const DonorCard = memo(function DonorCard({
  donor,
  index,
  onContact,
  onClick,
}: DonorCardProps) {
  const isAvailable = donor.availability === 'available';

  const availabilityColor = isAvailable
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';

  const lastDonationDate = donor.lastDonation && !isNaN(new Date(donor.lastDonation).getTime())
    ? new Date(donor.lastDonation)
    : null;

  const isRecentlyDonated = lastDonationDate
    ? Date.now() - lastDonationDate.getTime() < 90 * 24 * 60 * 60 * 1000
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md bg-white transition-all duration-200 overflow-hidden group cursor-pointer relative">
        <button
          type="button"
          onClick={() => onClick(donor)}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700"
          aria-label={`View details for ${donor.name}`}
        />

        <CardContent className="relative z-10 p-5 space-y-4 pointer-events-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                <Droplet className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 font-heading group-hover:text-teal-800 transition-colors truncate">
                  {donor.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                      bloodGroupColors[donor.bloodGroup] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {donor.bloodGroup || 'Not specified'}
                  </Badge>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">Consented Volunteer</span>
                </div>
              </div>
            </div>

            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${availabilityColor}`}
            >
              {isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-700 truncate">
                {donor.approximateArea || donor.city || 'Regional Health Network'}
              </span>
              {donor.distance !== undefined && donor.distance > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{donor.distance} km approx</span>
                </>
              )}
            </div>

            {lastDonationDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-600">
                  Last Donated:{' '}
                  {lastDonationDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {isRecentlyDonated && (
                  <Badge className="text-[9px] font-bold bg-amber-50 text-amber-800 border-amber-200 px-1.5 py-0.5">
                    Recovery Period
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs">
              {isAvailable ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span className={isAvailable ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                {isAvailable ? 'Ready for Donation' : 'Currently Unavailable'}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onContact(donor);
              }}
              className="h-8 text-xs font-bold rounded-lg border-teal-200 text-teal-800 hover:bg-teal-50 pointer-events-auto"
              disabled={!isAvailable}
              title="Request contact via secure platform notification"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Request Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
