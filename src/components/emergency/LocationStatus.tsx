import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface LocationStatusProps {
  onRefresh: () => void;
}

export const LocationStatus = memo(function LocationStatus({
  onRefresh,
}: LocationStatusProps) {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.0060);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: Backend integration for real location refresh
    setTimeout(() => {
      setLatitude(40.7128 + (Math.random() - 0.5) * 0.01);
      setLongitude(-74.0060 + (Math.random() - 0.5) * 0.01);
      setRefreshing(false);
      onRefresh();
    }, 1000);
  };

  const handleToggleLocation = () => {
    setLocationEnabled(!locationEnabled);
    // TODO: Backend integration for location sharing toggle
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
            disabled={refreshing}
            className="h-8 w-8 text-slate-500 hover:text-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
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
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleLocation}
            className="w-full h-9 text-xs font-bold rounded-lg"
          >
            {locationEnabled ? 'Disable Location' : 'Enable Location'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank')}
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
