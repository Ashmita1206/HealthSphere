import { memo, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Navigation, Loader2, AlertTriangle, Building2, RefreshCw } from 'lucide-react';
import { getNearbyHospitals, type Location } from '@/services/locationsService';

export interface NearbyHospitalsProps {
  userLat?: number | null;
  userLng?: number | null;
  onHospitalSelect?: (hospital: Location) => void;
  onHospitalsLoaded?: (count: number) => void;
}

export const NearbyHospitals = memo(function NearbyHospitals({
  userLat,
  userLng,
  onHospitalSelect,
  onHospitalsLoaded,
}: NearbyHospitalsProps) {
  const [hospitals, setHospitals] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchHospitals = useCallback(async () => {
    if (userLat == null || userLng == null) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getNearbyHospitals(userLat, userLng, 5000);

      if (result.error) {
        setError(result.error);
        setHospitals([]);
      } else {
        // Sort by distance
        const sorted = [...result.locations].sort(
          (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
        );
        setHospitals(sorted);
        onHospitalsLoaded?.(sorted.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nearby hospitals');
      setHospitals([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }, [userLat, userLng, onHospitalsLoaded]);

  // Auto-fetch when coordinates are available
  useEffect(() => {
    if (userLat != null && userLng != null) {
      void fetchHospitals();
    }
  }, [fetchHospitals, userLat, userLng]);

  const handleCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleDirections = (hospital: Location) => {
    // Use real coordinates for precise navigation
    const url = `https://www.openstreetmap.org/directions?from=${userLat},${userLng}&to=${hospital.latitude},${hospital.longitude}#map=15/${hospital.latitude}/${hospital.longitude}`;
    window.open(url, '_blank');
  };

  const formatDistance = (meters?: number) => {
    if (meters == null) return 'N/A';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // ---- No location provided ----
  if (userLat == null || userLng == null) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Nearby Hospitals</h3>
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-400 border border-blue-100 flex items-center justify-center">
              <MapPin className="h-7 w-7 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Enable Location</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Enable location sharing to find nearby hospitals and emergency rooms.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Loading state ----
  if (loading && !hasSearched) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Nearby Hospitals</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl border border-slate-200/80 shadow-sm bg-white animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                    <div className="h-3 w-32 bg-slate-100 rounded" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-8 flex-1 bg-slate-100 rounded-lg" />
                      <div className="h-8 flex-1 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Nearby Hospitals</h3>
        <Card className="rounded-2xl border border-rose-200/80 shadow-sm bg-white">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-400 border border-rose-100 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Unable to Load Hospitals</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">{error}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchHospitals}
              disabled={loading}
              className="text-xs font-bold rounded-lg"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Empty state (searched but found nothing) ----
  if (hasSearched && hospitals.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Nearby Hospitals</h3>
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center">
              <Building2 className="h-7 w-7 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">No Hospitals Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                No hospitals were found within 5km of your location. Try refreshing your location or expanding the search area.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchHospitals}
              disabled={loading}
              className="text-xs font-bold rounded-lg"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Search Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Hospitals list ----
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          Nearby Hospitals
          {hospitals.length > 0 && (
            <Badge className="ml-2 text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200">
              {hospitals.length} found
            </Badge>
          )}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={fetchHospitals}
          disabled={loading}
          className="h-7 w-7 text-slate-500 hover:text-slate-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {hospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="rounded-2xl border shadow-sm bg-white hover:shadow-card-hover transition-all border-slate-200/80 cursor-pointer"
                onClick={() => onHospitalSelect?.(hospital)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {hospital.name}
                        </h4>
                      </div>

                      {/* Address */}
                      {hospital.address && (
                        <p className="text-xs text-slate-500 mb-2 truncate">{hospital.address}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="font-medium text-slate-700">
                            {formatDistance(hospital.distance)}
                          </span>
                        </div>
                        {hospital.phone && (
                          <span className="text-slate-400 truncate max-w-[120px]">{hospital.phone}</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(hospital.phone);
                          }}
                          disabled={!hospital.phone}
                          className="flex-1 h-8 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          Call
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirections(hospital);
                          }}
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
        </AnimatePresence>
      </div>
    </div>
  );
});
