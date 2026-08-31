import { memo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocationStatusProps {
  onRefresh: () => void;
  onLocationChange?: (lat: number, lng: number) => void;
}

export const LocationStatus = memo(function LocationStatus({
  onRefresh,
  onLocationChange,
}: LocationStatusProps) {
  const {
    location,
    error,
    loading,
    requestLocation,
    isSupported,
  } = useGeolocation();

  const locationEnabled = location !== null;
  const latitude = location?.latitude ?? null;
  const longitude = location?.longitude ?? null;

  // Notify parent when location changes
  useEffect(() => {
    if (latitude !== null && longitude !== null && onLocationChange) {
      onLocationChange(latitude, longitude);
    }
  }, [latitude, longitude, onLocationChange]);

  const handleRefresh = async () => {
    await requestLocation();
    onRefresh();
  };

  const handleRequestLocation = async () => {
    await requestLocation();
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Location Status</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8 text-slate-500 hover:text-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Location Sharing</span>
            <Badge
              className={`text-[10px] font-bold ${
                locationEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {locationEnabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Enabled
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disabled
                </>
              )}
            </Badge>
          </div>

          {/* Error state */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          {/* Not supported state */}
          {!isSupported && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                Geolocation is not supported by your browser.
              </p>
            </div>
          )}

          {/* Coordinates display */}
          {latitude !== null && longitude !== null ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Latitude</span>
                <span className="font-mono font-bold text-slate-900">
                  {latitude.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Longitude</span>
                <span className="font-mono font-bold text-slate-900">
                  {longitude.toFixed(6)}
                </span>
              </div>
              {location?.accuracy && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Accuracy</span>
                  <span className="font-mono font-bold text-slate-900">
                    ±{Math.round(location.accuracy)}m
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                {loading ? 'Acquiring location...' : 'Location not available. Tap below to enable.'}
              </p>
            </div>
          )}

          {/* Enable/Refresh location button */}
          {!locationEnabled && isSupported && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRequestLocation}
              disabled={loading}
              className="w-full h-9 text-xs font-bold rounded-lg"
            >
              {loading ? 'Acquiring...' : 'Enable Location'}
            </Button>
          )}

          {/* Open in Maps */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (latitude !== null && longitude !== null) {
                window.open(
                  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`,
                  '_blank',
                );
              }
            }}
            disabled={!locationEnabled}
            className="w-full h-9 text-xs font-bold rounded-lg"
          >
            <Navigation className="h-3.5 w-3.5 mr-1.5" />
            Open in Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
