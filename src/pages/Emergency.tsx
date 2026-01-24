import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, MapPin, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { getNearbyLocations, openInMaps, type Location } from "@/services/locationsService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function EmergencyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    location: currentLocation,
    error: locationError,
    loading: locationLoading,
    requestLocation,
  } = useGeolocation();

  const [nearbyHospitals, setNearbyHospitals] = React.useState<Location[]>([]);
  const [sosTriggered, setSosTriggered] = React.useState(false);
  const [loadingHospitals, setLoadingHospitals] = React.useState(false);

  const emergencyNumbers = [
    { name: "Emergency Services", number: "911" },
    { name: "Poison Control", number: "1-800-222-1222" },
    { name: "Ambulance", number: "102" },
    { name: "Mental Health Crisis", number: "988" },
  ];

  // Auto-load nearby locations when location is available
  useEffect(() => {
    if (currentLocation) {
      loadNearbyHospitals();
    }
  }, [currentLocation]);

  const loadNearbyHospitals = async () => {
    if (!currentLocation) return;

    setLoadingHospitals(true);
    try {
      const result = await getNearbyLocations(
        currentLocation.latitude,
        currentLocation.longitude,
        5 // 5km radius
      );

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setNearbyHospitals(result.locations);
      }
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleSOS = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to use SOS",
        variant: "destructive",
      });
      return;
    }

    setSosTriggered(true);

    try {
      // Try to get location for SOS
      let latitude = currentLocation?.latitude;
      let longitude = currentLocation?.longitude;

      // If we don't have location, request it
      if (!latitude || !longitude) {
        await requestLocation();
      }

      // Save emergency alert to database
      const { error } = await supabase.from("emergency_alerts").insert({
        user_id: user.id,
        latitude,
        longitude,
        status: "active",
      });

      if (error) throw error;

      // Send notification
      toast({
        title: "SOS ACTIVATED",
        description: "Emergency services have been notified. Help is on the way.",
        variant: "destructive",
      });

      // Reset after 5 seconds
      setTimeout(() => setSosTriggered(false), 5000);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send SOS",
        variant: "destructive",
      });
      setSosTriggered(false);
    }
  };

  const callNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-8">Emergency Services</h1>

        {/* Error Alert */}
        {locationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {/* SOS Button */}
        <Card className="card-healthcare mb-8 border-destructive bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardContent className="flex flex-col items-center py-12">
            <motion.button
              onClick={handleSOS}
              disabled={sosTriggered}
              whileHover={{ scale: sosTriggered ? 1 : 1.05 }}
              whileTap={{ scale: sosTriggered ? 1 : 0.95 }}
              className="mb-6 h-32 w-32 rounded-full bg-gradient-to-br from-destructive to-destructive/80 text-white shadow-2xl hover:shadow-destructive/50 disabled:opacity-50 flex items-center justify-center transition-all"
            >
              {sosTriggered ? (
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
              ) : (
                <AlertTriangle className="h-12 w-12" />
              )}
            </motion.button>
            <h2 className="text-2xl font-bold">Emergency SOS</h2>
            <p className="mt-2 text-muted-foreground text-center max-w-md">
              Press the button above in case of emergency. This will alert emergency services and share your location.
            </p>
            {sosTriggered && (
              <p className="mt-4 text-sm text-destructive font-semibold animate-pulse">
                SOS signal being sent...
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Emergency Numbers */}
          <Card className="card-healthcare">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emergencyNumbers.map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="font-medium">{item.name}</span>
                  <button
                    onClick={() => callNumber(item.number)}
                    className="font-bold text-primary hover:underline transition-colors"
                  >
                    {item.number}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Location & Services */}
          <Card className="card-healthcare">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Your Location
              </CardTitle>
              <CardDescription>Find hospitals and services near you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={requestLocation}
                disabled={locationLoading}
                className="w-full btn-healthcare"
                variant="outline"
              >
                <Navigation className="mr-2 h-4 w-4" />
                {locationLoading ? "Getting Location..." : "Get Current Location"}
              </Button>
              {currentLocation && (
                <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
                  <p className="text-muted-foreground">
                    <strong>Latitude:</strong> {currentLocation.latitude.toFixed(4)}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Longitude:</strong> {currentLocation.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Accuracy:</strong> ±{Math.round(currentLocation.accuracy)} meters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nearby Locations */}
        <Card className="card-healthcare mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nearby Services
            </CardTitle>
            <CardDescription>Hospitals, clinics, and emergency centers within 5km</CardDescription>
          </CardHeader>
          <CardContent>
            {!currentLocation ? (
              <p className="text-muted-foreground text-center py-8">
                Please enable location to find nearby services
              </p>
            ) : loadingHospitals ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : nearbyHospitals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No services found within 5km radius
              </p>
            ) : (
              <div className="space-y-3">
                {nearbyHospitals.map((location) => (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{location.name}</h4>
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded capitalize font-medium">
                          {location.type.replace("-", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                      {location.distance !== undefined && (
                        <p className="text-xs text-primary mt-2 font-medium">
                          {location.distance.toFixed(1)} km away
                        </p>
                      )}
                      {location.rating && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Rating: {location.rating}/5.0
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => callNumber(location.phone)}
                        title={`Call ${location.name}`}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInMaps(location.latitude, location.longitude, location.name)}
                        title="Get directions"
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
