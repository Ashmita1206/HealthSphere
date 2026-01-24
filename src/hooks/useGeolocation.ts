import { useState, useCallback, useRef, useEffect } from "react";

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  location: GeolocationCoordinates | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => Promise<void>;
  watchLocation: () => void;
  stopWatching: () => void;
  isSupported: boolean;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const isSupported = "geolocation" in navigator;

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    setLocation({ latitude, longitude, accuracy });
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = "Unable to get location";
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = "Location permission denied. Please enable location services.";
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = "Location information unavailable.";
        break;
      case err.TIMEOUT:
        errorMessage = "Location request timed out.";
        break;
    }
    
    setError(errorMessage);
    setLoading(false);
  }, []);

  const requestLocation = useCallback(async () => {
    if (!isSupported) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [isSupported, handleSuccess, handleError]);

  const watchLocation = useCallback(() => {
    if (!isSupported) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
  }, [isSupported, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    location,
    error,
    loading,
    requestLocation,
    watchLocation,
    stopWatching,
    isSupported,
  };
}
