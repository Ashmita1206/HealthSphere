import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Navigation,
  AlertCircle,
  ShieldAlert,
  Radio,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import RouteMap from '@/components/RouteMap';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getNearbyHospitals, type Location } from '@/services/locationsService';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';

// =================== Web Speech Helper ===================
const speak = (text: string, lang = 'en-US') => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onend = () => console.log('Speech finished');
  utterance.onerror = (err) => console.error('Speech error', err);
  setTimeout(() => window.speechSynthesis.speak(utterance), 0);
};

export default function EmergencyPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    location: currentLocation,
    error: locationError,
    loading: locationLoading,
    requestLocation,
    watchLocation,
  } = useGeolocation();

  const [nearbyHospitals, setNearbyHospitals] = useState<Location[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Location | null>(
    null,
  );
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  // =================== SOS State ===================
  const [sosTriggered, setSosTriggered] = useState(false);
  const sosInterval = useRef<NodeJS.Timeout | null>(null);

  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);

  // ======= Controlled hospital fetch state =======
  const [fetchHospitalsOnLocation, setFetchHospitalsOnLocation] =
    useState(false);
  const [hospitalError, setHospitalError] = useState<string | null>(null);
  const fetchingHospitalsRef = useRef(false);
  const emergencyNumbers = [
    { name: 'National Emergency Dispatch', number: '911', desc: 'Police, Fire & General SOS' },
    { name: 'Poison Control Hotline', number: '1-800-222-1222', desc: 'Toxic & Chemical Ingestion' },
    { name: 'Ambulance & Trauma Response', number: '102', desc: 'Medical Transport Unit' },
    { name: 'Mental Health Crisis Line', number: '988', desc: 'Suicide & Distress Helpline' },
  ];

  // =================== Load Nearby Hospitals (button-triggered) ===================
  useEffect(() => {
    let cancelled = false;

    const loadHospitals = async () => {
      if (!fetchHospitalsOnLocation || !currentLocation) return;
      if (fetchingHospitalsRef.current) return; // prevent duplicates

      fetchingHospitalsRef.current = true;
      setHospitalError(null);
      setLoadingHospitals(true);

      try {
        const result = await getNearbyHospitals(
          currentLocation.latitude,
          currentLocation.longitude,
        );

        if (cancelled) return;

        if (result.error) {
          setNearbyHospitals([]);
          setHospitalError('Unable to fetch nearby hospitals. Please try again.');
        } else {
          setNearbyHospitals(result.locations);
        }
      } catch (err) {
        if (!cancelled) {
          setNearbyHospitals([]);
          setHospitalError('Unable to fetch nearby hospitals. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoadingHospitals(false);
          setFetchHospitalsOnLocation(false);
          fetchingHospitalsRef.current = false;
        }
      }
    };

    loadHospitals();

    return () => {
      cancelled = true;
    };
  }, [currentLocation, fetchHospitalsOnLocation]);

  // =================== SOS Functions ===================
  const stopSOS = useCallback(async () => {
    setSosTriggered(false);
    if (sosInterval.current) {
      clearInterval(sosInterval.current);
      sosInterval.current = null;
    }

    if (user) {
      try {
        await api.post('/emergency/resolve');
      } catch (error) {
        console.error('Error stopping SOS in database:', error);
      }
    }

    speak('Emergency SOS deactivated. Emergency ended.');
    toast({
      title: 'SOS Deactivated',
      description: 'Emergency ended',
      variant: 'default',
    });
  }, [user, toast]);

  const startSOS = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to use SOS',
        variant: 'destructive',
      });
      return;
    }

    setSosTriggered(true);

    try {
      await requestLocation(); // trigger GPS update

      if (!currentLocation) {
        throw new Error('Location not available');
      }
      const { latitude, longitude } = currentLocation;

      await api.post('/emergency/sos', { latitude, longitude });

      speak('Emergency SOS activated. Live location sharing started.');
      toast({
        title: '🚨 SOS Activated',
        description: 'Live tracking started',
        variant: 'destructive',
      });

      // Start live location updates every 5 seconds
      sosInterval.current = setInterval(async () => {
        try {
          // 1. Trigger geolocation update
          await requestLocation();

          // 2. Read location from state
          if (!currentLocation || !user) return;

          const { latitude, longitude } = currentLocation;

          await api.post('/emergency/sos', { latitude, longitude });
        } catch (err) {
          console.error('Error updating SOS location:', err);
        }
      }, 5000);
    } catch (err: any) {
      console.error('Error starting SOS:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to activate SOS',
        variant: 'destructive',
      });
      setSosTriggered(false);
      stopSOS();
    }
  }, [user, requestLocation, toast, stopSOS]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (sosInterval.current) {
        clearInterval(sosInterval.current);
        sosInterval.current = null;
      }
    };
  }, []);

  const callNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleGetLocationClick = async () => {
    setHospitalError(null);
    setNearbyHospitals([]);
    setSelectedHospital(null);
    setFetchHospitalsOnLocation(true);
    try {
      await requestLocation();
    } catch (err) {
      setFetchHospitalsOnLocation(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <PageHeader
        title="24/7 Emergency SOS & Trauma Dispatch"
        description="One-touch GPS emergency broadcast, live location sharing, and nearby hospital routing."
        breadcrumbs={[{ label: "Emergency" }]}
        badge="Urgent Response"
      />

      {locationError && (
        <Alert variant="destructive" className="rounded-2xl bg-rose-50 border-rose-200 text-rose-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-semibold">{locationError}</AlertDescription>
        </Alert>
      )}

      {/* SOS MAIN RED CARD */}
      <Card className="rounded-3xl border-2 border-rose-600 bg-gradient-to-b from-rose-900 via-rose-950 to-slate-950 text-white shadow-2xl overflow-hidden relative">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 relative text-center">
          
          {/* Animated Pulsing Ring */}
          {sosTriggered && (
            <motion.div
              className="absolute h-64 w-64 bg-rose-500/30 rounded-full pointer-events-none"
              animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}

          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-bold border border-white/20">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>{sosTriggered ? "LIVE SOS BROADCAST ACTIVE" : "EMERGENCY DISPATCH READY"}</span>
          </div>

          <motion.button
            onClick={sosTriggered ? stopSOS : startSOS}
            animate={sosTriggered ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{
              repeat: sosTriggered ? Infinity : 0,
              duration: 0.8,
            }}
            whileTap={{ scale: 0.95 }}
            className={`mb-6 w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl relative transition-all duration-300 ${
              sosTriggered
                ? "bg-rose-500 text-white ring-8 ring-rose-400/40"
                : "bg-rose-600 text-white hover:bg-rose-500 hover:scale-105"
            }`}
          >
            <ShieldAlert className="w-14 h-14 stroke-[2.2]" />
            <span className="text-xs font-extrabold uppercase tracking-wider mt-1">
              {sosTriggered ? "CANCEL SOS" : "PRESS FOR SOS"}
            </span>
          </motion.button>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
            {sosTriggered ? "Emergency Broadcast Active" : "One-Touch Emergency SOS"}
          </h2>
          
          <p className="mt-2 text-xs sm:text-sm text-rose-100/90 max-w-md font-normal leading-relaxed">
            {sosTriggered
              ? "Your precise GPS location is being transmitted every 5 seconds to emergency response centers."
              : "Press the red button above in an emergency to alert nearby trauma hospitals and emergency contacts."}
          </p>

          {sosTriggered && (
            <Button
              onClick={stopSOS}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl border border-slate-700"
            >
              Deactivate & End SOS
            </Button>
          )}
        </CardContent>
      </Card>

      {/* NUMBERS + LOCATION SELECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Emergency Numbers Grid */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Phone className="w-5 h-5 text-rose-600" />
              Direct Emergency Hotlines
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Tap to instantly dial national helpline services</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {emergencyNumbers.map((e) => (
              <div
                key={e.name}
                onClick={() => callNumber(e.number)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-rose-50/50 hover:border-rose-200 transition-all cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-heading group-hover:text-rose-700 transition-colors">{e.name}</h4>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">{e.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                    {e.number}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* GPS Location & Hospital Locator */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-700" />
              Trauma Hospital Locator
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-normal">Detect GPS coordinates to find nearest open medical centers</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <Button
              onClick={handleGetLocationClick}
              disabled={locationLoading || loadingHospitals}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              <span>{locationLoading ? "Fetching GPS Coordinates..." : "Locate Nearby Hospitals"}</span>
            </Button>

            <div>
              {locationLoading && fetchHospitalsOnLocation && (
                <div className="text-xs text-slate-500 italic p-3 text-center">Acquiring satellite GPS fix...</div>
              )}

              {!locationLoading && loadingHospitals && (
                <div className="text-xs text-teal-700 font-bold p-3 text-center flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                  <span>Searching open trauma emergency centers...</span>
                </div>
              )}

              {hospitalError && (
                <Alert variant="destructive" className="mt-2 rounded-xl bg-rose-50 border-rose-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-semibold">{hospitalError}</AlertDescription>
                </Alert>
              )}

              {!hospitalError && !loadingHospitals && nearbyHospitals.length > 0 && (
                <div className="mt-2 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 font-heading uppercase tracking-wider mb-2">
                    Verified Emergency Centers
                  </h4>

                  <HospitalList
                    hospitals={nearbyHospitals}
                    selectedHospitalId={selectedHospital?.id}
                    onSelect={(h) => setSelectedHospital(h)}
                    visibleCount={visibleCount}
                    onShowMore={() => setVisibleCount((c) => c + 6)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ROUTE MAP CONTAINER */}
      <AnimatePresence>
        {selectedHospital && currentLocation && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-extrabold text-slate-900 font-heading flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-700" />
                    <span>Emergency Route to {selectedHospital.name}</span>
                  </div>
                  {routeDistance && routeTime && (
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      {(routeDistance / 1000).toFixed(1)} km • {Math.round(routeTime / 60)} mins drive
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-96 p-0 relative">
                <RouteMap
                  userLat={currentLocation.latitude}
                  userLng={currentLocation.longitude}
                  destLat={selectedHospital.latitude}
                  destLng={selectedHospital.longitude}
                  onRouteFound={(d, t) => {
                    setRouteDistance(d);
                    setRouteTime(t);
                  }}
                  showHospitalPins
                  selectedHospitalId={selectedHospital.id}
                  sosTriggered={sosTriggered}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ------- Hospital list subcomponent -------
function HospitalList({
  hospitals,
  selectedHospitalId,
  onSelect,
  visibleCount,
  onShowMore,
}: {
  hospitals: Location[];
  selectedHospitalId?: string | undefined;
  onSelect: (h: Location) => void;
  visibleCount: number;
  onShowMore: () => void;
}) {
  const filtered = useMemo(() => {
    const map = new Map<string, Location>();
    for (const h of hospitals) {
      const name = (h.name || '').trim();
      if (!name || /unnamed hospital/i.test(name)) continue;
      if (!map.has(h.id)) map.set(h.id, h);
    }
    return Array.from(map.values());
  }, [hospitals]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-2">
      <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
        {visible.map((hospital) => {
          const isSelected = selectedHospitalId === hospital.id;
          return (
            <motion.div
              key={hospital.id}
              onClick={() => onSelect(hospital)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-teal-50 border-teal-300 shadow-sm"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100"
              }`}
            >
              <div className="flex-1 truncate">
                <h5 className="text-xs font-bold text-slate-900 font-heading truncate">{hospital.name}</h5>
                <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">{hospital.address}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hospital.distance != null && (
                  <span className="text-[10px] font-bold text-teal-800 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {(hospital.distance / 1000).toFixed(1)} km
                  </span>
                )}
                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className={`h-8 text-xs font-bold px-3 rounded-lg ${
                    isSelected ? "bg-teal-700 text-white" : "border-slate-300"
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length > visibleCount && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onShowMore}
          className="w-full text-xs font-bold text-teal-700 hover:bg-teal-50 rounded-xl"
        >
          Show More Hospitals ({filtered.length - visibleCount} remaining)
        </Button>
      )}
    </div>
  );
}

