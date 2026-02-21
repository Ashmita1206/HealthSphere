import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Navigation,
  AlertCircle,
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    { name: 'Emergency Services', number: '911' },
    { name: 'Poison Control', number: '1-800-222-1222' },
    { name: 'Ambulance', number: '102' },
    { name: 'Mental Health Crisis', number: '988' },
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
        const { error } = await supabase
          .from('emergency_alerts')
          .update({ status: 'resolved' })
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (error) throw error;
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

      // ✅ Insert initial SOS in DB
      const { error: insertError } = await supabase
        .from('emergency_alerts')
        .insert({
          user_id: user.id,
          latitude,
          longitude,
          status: 'active',
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

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

          // 3. Update Supabase
          const { error } = await supabase
            .from('emergency_alerts')
            .update({
              latitude,
              longitude,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('status', 'active');

          if (error) throw error;
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
    // Reset previous state and request location, then effect will fetch hospitals
    setHospitalError(null);
    setNearbyHospitals([]);
    setSelectedHospital(null);
    setFetchHospitalsOnLocation(true);
    try {
      await requestLocation();
    } catch (err) {
      // requestLocation uses callbacks; errors are surfaced via locationError
      setFetchHospitalsOnLocation(false);
    }
  };

  // =================== JSX ===================
  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
          Emergency Services
        </h1>

        {locationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {/* ================= SOS BUTTON ================= */}
        <Card className="mb-8 border-2 border-red-600 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="flex flex-col items-center py-12 relative">
            {sosTriggered && (
              <motion.div
                className="absolute h-40 w-40 bg-red-500/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            )}

            <motion.button
              onClick={sosTriggered ? stopSOS : startSOS}
              animate={sosTriggered ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{
                repeat: sosTriggered ? Infinity : 0,
                duration: 0.8,
              }}
              whileTap={{ scale: 0.9 }}
              className="mb-6 h-32 w-32 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl relative overflow-hidden"
            >
              <AlertTriangle className="h-12 w-12" />
            </motion.button>

            <h2 className="text-2xl font-bold">Emergency SOS</h2>
            <p className="mt-2 text-muted-foreground text-center max-w-md">
              Press in emergency. Your live location will be shared.
            </p>

            {sosTriggered && (
              <Button
                onClick={stopSOS}
                className="mt-4 w-32 bg-gray-800 text-white"
              >
                Stop SOS
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ================= NUMBERS + LOCATION ================= */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex gap-2">
                <Phone /> Emergency Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emergencyNumbers.map((e) => (
                <motion.div
                  key={e.name}
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-between p-3 rounded bg-muted cursor-pointer"
                >
                  <span>{e.name}</span>
                  <button
                    className="font-bold text-primary"
                    onClick={() => callNumber(e.number)}
                  >
                    {e.number}
                  </button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex gap-2">
                <MapPin /> Your Location
              </CardTitle>
              <CardDescription>Used for emergency routing</CardDescription>
            </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGetLocationClick}
                  disabled={locationLoading || loadingHospitals}
                  className="w-full"
                  variant="outline"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Get Current Location
                </Button>

                <div className="mt-4">
                  {locationLoading && fetchHospitalsOnLocation && (
                    <div className="text-sm text-muted-foreground">Fetching location...</div>
                  )}

                  {!locationLoading && loadingHospitals && (
                    <div className="text-sm text-muted-foreground">Loading nearby hospitals...</div>
                  )}

                  {hospitalError && (
                    <div className="mt-3">
                      <Alert variant="destructive" className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{hospitalError}</AlertDescription>
                        </div>
                        <Button size="sm" onClick={handleGetLocationClick}>
                          Retry
                        </Button>
                      </Alert>
                    </div>
                  )}

                  {!hospitalError && !loadingHospitals && (
                    <div className="mt-4">
                      <CardTitle className="mb-2">Nearby Hospitals</CardTitle>

                      {/* prepare and display filtered, deduped hospitals */}
                      {/**
                       * Filter rules:
                       * - remove duplicates by id
                       * - hide invalid or generic names like 'Unnamed Hospital'
                       */}
                      <HospitalList
                        hospitals={nearbyHospitals}
                        selectedHospitalId={selectedHospital?.id}
                        onSelect={(h) => setSelectedHospital(h)}
                        visibleCount={visibleCount}
                        onShowMore={() => setVisibleCount((c) => c + 6)}
                      />

                      {/* No hospitals fallback */}
                      {nearbyHospitals.length === 0 && (
                        <div className="text-sm text-muted-foreground mt-3">No hospitals found nearby.</div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
          </Card>
        </div>

        

        {/* ================= ROUTE MAP ================= */}
        <AnimatePresence>
          {selectedHospital && currentLocation && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mt-6 shadow-xl overflow-hidden rounded-xl relative">
                <CardContent className="relative h-96 p-0">
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

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-4 left-4 bg-white/90 p-4 rounded-xl shadow-lg z-[1000]"
                  >
                    <h3 className="font-bold">{selectedHospital.name}</h3>
                    {routeDistance && routeTime && (
                      <p className="text-xs text-gray-500">
                        {(routeDistance / 1000).toFixed(1)} km ·{' '}
                        {Math.round(routeTime / 60)} min
                      </p>
                    )}
                    <Button
                      onClick={sosTriggered ? stopSOS : startSOS}
                      className="mt-2 w-full bg-red-600 text-white"
                    >
                      {sosTriggered ? 'Stop SOS' : 'Activate SOS'}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ------- Hospital list subcomponent (UI-only, keeps parent logic unchanged) -------
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
      if (!name || /unnamed hospital/i.test(name)) continue; // hide invalid names
      if (!map.has(h.id)) map.set(h.id, h);
    }
    return Array.from(map.values());
  }, [hospitals]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div>
      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground">No hospitals found.</div>
      ) : (
        <div className="max-h-80 overflow-auto pr-2 smooth-scroll">
          <div className="space-y-3">
            {visible.map((hospital) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-between p-3 rounded border bg-white cursor-pointer`}
                onClick={() => onSelect(hospital)}
              >
                <div className="flex-1 pr-3">
                  <div className="font-semibold text-sm">{hospital.name}</div>
                  <div className="text-xs text-muted-foreground">{hospital.address}</div>
                </div>
                <div className="flex items-center gap-3">
                  {hospital.distance != null && (
                    <div className="text-xs text-muted-foreground">
                      {(hospital.distance / 1000).toFixed(1)} km
                    </div>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onSelect(hospital)}>
                    <Navigation />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {filtered.length > visibleCount && (
        <div className="mt-3 flex justify-center">
          <Button size="sm" onClick={onShowMore}>
            Show More
          </Button>
        </div>
      )}
    </div>
  );
}
