import React, { useEffect, useState, useRef, useCallback } from 'react';
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

  // =================== SOS State ===================
  const [sosTriggered, setSosTriggered] = useState(false);
  const sosInterval = useRef<NodeJS.Timeout | null>(null);

  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);

  const routeRef = useRef<HTMLDivElement>(null);

  const emergencyNumbers = [
    { name: 'Emergency Services', number: '911' },
    { name: 'Poison Control', number: '1-800-222-1222' },
    { name: 'Ambulance', number: '102' },
    { name: 'Mental Health Crisis', number: '988' },
  ];

  // =================== Load Nearby Hospitals ===================
  useEffect(() => {
    if (!currentLocation) return;

    const loadHospitals = async () => {
      setLoadingHospitals(true);
      const result = await getNearbyHospitals(
        currentLocation.latitude,
        currentLocation.longitude,
      );
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setNearbyHospitals(result.locations);
      }
      setLoadingHospitals(false);
    };
    loadHospitals();
  }, [currentLocation, toast]);

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
      const location = await requestLocation();
      if (!location) throw new Error('Location not available');

      // Insert initial SOS in DB
      const { error: insertError } = await supabase
        .from('emergency_alerts')
        .insert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
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
          const updatedLocation = await requestLocation();
          if (!updatedLocation || !user) return;

          const { error: updateError } = await supabase
            .from('emergency_alerts')
            .update({
              latitude: updatedLocation.latitude,
              longitude: updatedLocation.longitude,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('status', 'active');

          if (updateError) throw updateError;
        } catch (intervalError) {
          console.error('Error updating location in interval:', intervalError);
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
                onClick={requestLocation}
                disabled={locationLoading}
                className="w-full"
                variant="outline"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Get Current Location
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ================= HOSPITAL LIST ================= */}
        <div ref={routeRef} className="mt-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Nearby Hospitals</CardTitle>
              <CardDescription>Within 5km</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {nearbyHospitals.map((hospital) => (
                  <motion.div
                    key={hospital.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex justify-between p-4 rounded border mb-3 cursor-pointer ${
                      selectedHospital?.id === hospital.id
                        ? 'bg-red-50 border-red-500'
                        : 'bg-white'
                    }`}
                    onClick={() => setSelectedHospital(hospital)}
                  >
                    <div>
                      <h4 className="font-semibold">{hospital.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {hospital.address}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedHospital(hospital)}
                    >
                      <Navigation />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
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
