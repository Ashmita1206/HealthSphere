import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Phone, Clock, Navigation, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface Ambulance {
  id: string;
  provider: string;
  status: 'available' | 'busy' | 'offline';
  eta: number;
  phone: string;
}

interface NearbyAmbulancesProps {
  ambulances?: Ambulance[];
}

const dummyAmbulances: Ambulance[] = [
  {
    id: '1',
    provider: 'City Ambulance Service',
    status: 'available',
    eta: 8,
    phone: '+1 234 567 8904',
  },
  {
    id: '2',
    provider: 'Emergency Medical Response',
    status: 'busy',
    eta: 12,
    phone: '+1 234 567 8905',
  },
  {
    id: '3',
    provider: 'HealthSphere Ambulance',
    status: 'available',
    eta: 15,
    phone: '+1 234 567 8906',
  },
];

export const NearbyAmbulances = memo(function NearbyAmbulances({
  ambulances = dummyAmbulances,
}: NearbyAmbulancesProps) {
  const statusConfig = {
    available: {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Available',
    },
    busy: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      label: 'Busy',
    },
    offline: {
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      label: 'Offline',
    },
  };

  const handleCall = (phone: string) => {
    // TODO: Backend integration for ambulance calling
    window.open(`tel:${phone}`, '_self');
  };

  const handleTrack = (ambulance: Ambulance) => {
    // TODO: Backend integration for ambulance tracking
    window.open(`https://maps.google.com/?q=${ambulance.provider}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-900">Nearby Ambulances</h3>
        <Badge className="text-[9px] font-bold bg-amber-50 text-amber-800 border-amber-300 gap-1">
          <Info className="h-2.5 w-2.5" />
          Simulated Dispatch (Real-Time GPS Telematics Unavailable)
        </Badge>
      </div>


      <div className="space-y-3">
        {ambulances.map((ambulance, index) => {
          const config = statusConfig[ambulance.status];
          return (
            <motion.div
              key={ambulance.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white hover:shadow-card-hover transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {ambulance.provider}
                          </h4>
                          <Badge
                            className={`text-[10px] font-bold ${config.color}`}
                          >
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="font-medium text-slate-700">ETA: {ambulance.eta} min</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCall(ambulance.phone)}
                        className="h-8 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                        disabled={ambulance.status !== 'available'}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrack(ambulance)}
                        className="h-8 text-xs font-bold rounded-lg"
                        disabled={ambulance.status !== 'available'}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
