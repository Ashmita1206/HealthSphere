import { memo } from 'react';
import { motion } from 'framer-motion';
import { Droplet, MapPin, Phone, Mail, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
}

interface DonorCardProps {
  donor: Donor;
  index: number;
  onContact: (donor: Donor) => void;
  onClick: (donor: Donor) => void;
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

export const DonorCard = memo(function DonorCard({
  donor,
  index,
  onContact,
  onClick,
}: DonorCardProps) {
  const availabilityColor = donor.availability === 'available'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-slate-50 text-slate-500 border-slate-200';

  const lastDonationDate = donor.lastDonation
    ? new Date(donor.lastDonation)
    : null;

  const isRecentlyDonated = lastDonationDate
    ? (Date.now() - lastDonationDate.getTime()) < 90 * 24 * 60 * 60 * 1000
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover bg-white transition-all duration-300 overflow-hidden group cursor-pointer">
        <button
          type="button"
          onClick={() => onClick(donor)}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-600"
          aria-label={`View details for ${donor.name}`}
        />
        <CardContent className="relative z-10 p-5 space-y-4 pointer-events-none">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                <Droplet className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-rose-800 transition-colors">
                  {donor.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`text-xs font-bold uppercase tracking-wider ${bloodGroupColors[donor.bloodGroup] || bloodGroupColors['O+']}`}
                  >
                    {donor.bloodGroup}
                  </Badge>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500">{donor.age} yrs</span>
                </div>
              </div>
            </div>

            <Badge
              className={`text-[10px] font-bold uppercase tracking-wider ${availabilityColor}`}
            >
              {donor.availability}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{donor.city}</span>
            {donor.distance !== undefined && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">{donor.distance} km away</span>
              </>
            )}
          </div>

          {lastDonationDate && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">
                Last: {lastDonationDate.toLocaleDateString()}
              </span>
              {isRecentlyDonated && (
                <Badge className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                  Recovery
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              {donor.availability === 'available' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span className="font-medium">
                {donor.availability === 'available' ? 'Ready to donate' : 'Not available'}
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
              className="h-8 text-xs font-bold rounded-lg pointer-events-auto"
              disabled={donor.availability !== 'available'}
            >
              <Phone className="h-3.5 w-3.5 mr-1.5" />
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
