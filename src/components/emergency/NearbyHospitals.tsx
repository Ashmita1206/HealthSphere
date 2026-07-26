import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Navigation, Bed } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  distance: number;
  emergencyAvailable: boolean;
  twentyFourSeven: boolean;
  bedsAvailable?: number;
  phone: string;
}

interface NearbyHospitalsProps {
  hospitals?: Hospital[];
}

const dummyHospitals: Hospital[] = [
  {
    id: '1',
    name: 'HealthSphere Central Hospital',
    distance: 2.5,
    emergencyAvailable: true,
    twentyFourSeven: true,
    bedsAvailable: 15,
    phone: '+1 234 567 8901',
  },
  {
    id: '2',
    name: 'City General Hospital',
    distance: 4.2,
    emergencyAvailable: true,
    twentyFourSeven: true,
    bedsAvailable: 8,
    phone: '+1 234 567 8902',
  },
  {
    id: '3',
    name: 'St. Mary Medical Center',
    distance: 6.8,
    emergencyAvailable: false,
    twentyFourSeven: true,
    bedsAvailable: 0,
    phone: '+1 234 567 8903',
  },
];

export const NearbyHospitals = memo(function NearbyHospitals({
  hospitals = dummyHospitals,
}: NearbyHospitalsProps) {
  const handleCall = (phone: string) => {
    // TODO: Backend integration for hospital calling
    window.open(`tel:${phone}`, '_self');
  };

  const handleDirections = (hospital: Hospital) => {
    // TODO: Backend integration for directions
    window.open(`https://maps.google.com/?q=${hospital.name}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Nearby Hospitals</h3>

      <div className="space-y-3">
        {hospitals.map((hospital, index) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`rounded-2xl border shadow-sm bg-white hover:shadow-card-hover transition-all ${
              hospital.emergencyAvailable ? 'border-emerald-200/80' : 'border-slate-200/80'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {hospital.name}
                      </h4>
                      {hospital.emergencyAvailable ? (
                        <Badge className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                          Emergency Open
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] font-bold bg-rose-50 text-rose-700 border-rose-200">
                          Emergency Closed
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="font-medium text-slate-700">{hospital.distance} km</span>
                      </div>
                      {hospital.twentyFourSeven && (
                        <Badge className="text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200">
                          24x7
                        </Badge>
                      )}
                      {hospital.bedsAvailable !== undefined && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5" />
                          <span className="font-medium text-slate-700">{hospital.bedsAvailable} beds</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCall(hospital.phone)}
                        className="flex-1 h-8 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Call
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDirections(hospital)}
                        className="flex-1 h-8 text-xs font-bold rounded-lg"
                      >
                        <Navigation className="h-3.5 w-3.5 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
