# API Reference - HealthSphere Guardian

Complete API reference for all custom hooks and services created in this project.

---

## 🪝 Hooks

### useGeolocation()

**Purpose:** Access device GPS location with permission handling

**Import:**
```tsx
import { useGeolocation } from '@/hooks/useGeolocation';
```

**Usage:**
```tsx
const { location, error, loading, requestLocation, watchLocation, stopWatching, isSupported } = useGeolocation();

// Request location once
const handleGetLocation = async () => {
  await requestLocation();
  if (location) {
    console.log(`Lat: ${location.latitude}, Lon: ${location.longitude}`);
  }
};

// Continuous tracking
const handleStartTracking = () => {
  watchLocation();
};

const handleStopTracking = () => {
  stopWatching();
};
```

**Return Type:**
```tsx
interface UseGeolocationReturn {
  // Current location data
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;  // in meters (±X)
  } | null;
  
  // Error message if any
  error: string | null;
  
  // Loading state during request
  loading: boolean;
  
  // Functions
  requestLocation: () => Promise<void>;
  watchLocation: () => void;
  stopWatching: () => void;
  
  // Browser support flag
  isSupported: boolean;
}
```

**Error Messages:**
- `"Location permission denied. Please enable location services."`
- `"Location information unavailable."`
- `"Location request timed out."`
- `"Geolocation is not supported by your browser"`

**Example:**
```tsx
function LocationComponent() {
  const { location, requestLocation, loading, error } = useGeolocation();
  
  return (
    <div>
      <button onClick={requestLocation} disabled={loading}>
        {loading ? 'Getting location...' : 'Get My Location'}
      </button>
      
      {error && <p className="error">{error}</p>}
      
      {location && (
        <div>
          <p>Latitude: {location.latitude.toFixed(4)}</p>
          <p>Longitude: {location.longitude.toFixed(4)}</p>
          <p>Accuracy: ±{Math.round(location.accuracy)}m</p>
        </div>
      )}
    </div>
  );
}
```

---

### useSpeechRecognition()

**Purpose:** Capture voice input using Web Speech API

**Import:**
```tsx
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
```

**Usage:**
```tsx
const { 
  isListening, 
  transcript, 
  interimTranscript, 
  error, 
  startListening, 
  stopListening, 
  resetTranscript,
  hasPermission,
  isSupported 
} = useSpeechRecognition();

// Start listening
const handleStartListening = () => {
  startListening();
};

// Stop listening
const handleStopListening = () => {
  stopListening();
};

// Clear transcript
const handleReset = () => {
  resetTranscript();
};
```

**Return Type:**
```tsx
interface UseSpeechRecognitionReturn {
  // Whether currently listening
  isListening: boolean;
  
  // Final transcript collected so far
  transcript: string;
  
  // Interim (not yet finalized) transcript
  interimTranscript: string;
  
  // Error message if any
  error: string | null;
  
  // Whether user granted permission
  hasPermission: boolean;
  
  // Browser support flag
  isSupported: boolean;
  
  // Functions
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}
```

**Error Messages:**
- `"No speech detected. Please try again."`
- `"No microphone found. Ensure it's connected."`
- `"Network error. Check your connection."`
- `"Microphone permission denied."`
- `"Error: [specific error code]"`

**Example:**
```tsx
function VoiceInputComponent() {
  const [input, setInput] = useState('');
  const { 
    isListening, 
    transcript, 
    interimTranscript, 
    error, 
    startListening, 
    stopListening 
  } = useSpeechRecognition();
  
  // Add transcript to input when speech ends
  useEffect(() => {
    if (transcript && !isListening) {
      setInput(prev => prev + ' ' + transcript);
    }
  }, [transcript, isListening]);
  
  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      
      <button onClick={startListening} disabled={isListening}>
        Start Voice
      </button>
      
      <button onClick={stopListening} disabled={!isListening}>
        Stop Voice
      </button>
      
      {isListening && (
        <p className="interim">{interimTranscript}</p>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

### useMediaPermissions()

**Purpose:** Manage camera and microphone permissions

**Import:**
```tsx
import { useMediaPermissions } from '@/hooks/useMediaPermissions';
```

**Usage:**
```tsx
const { 
  micPermission, 
  cameraPermission, 
  requestMicPermission, 
  requestCameraPermission, 
  requestBothPermissions,
  stream,
  releaseStream
} = useMediaPermissions();

// Request only microphone
const handleMicRequest = async () => {
  const granted = await requestMicPermission();
  if (granted) {
    console.log('Mic permission granted');
  }
};

// Request both
const handleBothRequest = async () => {
  const granted = await requestBothPermissions();
  if (granted) {
    // Use stream for video/audio
    videoElement.srcObject = stream;
  }
};

// Cleanup when done
const handleCleanup = () => {
  releaseStream();
};
```

**Return Type:**
```tsx
interface UseMediaPermissionsReturn {
  // Permission states
  micPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  cameraPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  
  // Permission request functions
  requestMicPermission: () => Promise<boolean>;
  requestCameraPermission: () => Promise<boolean>;
  requestBothPermissions: () => Promise<boolean>;
  
  // Current media stream
  stream: MediaStream | null;
  
  // Cleanup function
  releaseStream: () => void;
}
```

**Permission States:**
- `'prompt'` - Not yet requested
- `'granted'` - User approved
- `'denied'` - User declined
- `'unknown'` - API not available

**Example:**
```tsx
function CameraComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { 
    cameraPermission, 
    requestCameraPermission, 
    stream,
    releaseStream 
  } = useMediaPermissions();
  
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  const handleStartCamera = async () => {
    if (cameraPermission === 'prompt') {
      const granted = await requestCameraPermission();
      if (!granted) {
        alert('Please enable camera permissions');
      }
    }
  };
  
  const handleStopCamera = () => {
    releaseStream();
  };
  
  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      
      {cameraPermission === 'prompt' && (
        <button onClick={handleStartCamera}>Start Camera</button>
      )}
      
      {cameraPermission === 'granted' && (
        <button onClick={handleStopCamera}>Stop Camera</button>
      )}
      
      {cameraPermission === 'denied' && (
        <p>Camera access denied. Enable in settings.</p>
      )}
    </div>
  );
}
```

---

## 🔧 Services

### locationsService.getNearbyLocations()

**Purpose:** Find nearby hospitals, clinics, pharmacies, etc.

**Import:**
```tsx
import { getNearbyLocations } from '@/services/locationsService';
```

**Signature:**
```tsx
async function getNearbyLocations(
  userLat: number,
  userLon: number,
  radiusKm?: number,  // default: 5
  type?: 'hospital' | 'clinic' | 'pharmacy' | 'emergency' | 'mental-health'
): Promise<NearbyLocationsResult>
```

**Usage:**
```tsx
// Find all nearby locations within 5km
const result = await getNearbyLocations(40.7128, -74.0060);

// Find only hospitals within 10km
const hospitals = await getNearbyLocations(40.7128, -74.0060, 10, 'hospital');

// Check for errors
if (result.error) {
  console.error('Error:', result.error);
} else {
  result.locations.forEach(location => {
    console.log(`${location.name}: ${location.distance?.toFixed(1)}km away`);
  });
}
```

**Return Type:**
```tsx
interface Location {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'emergency' | 'mental-health';
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;      // in km
  rating?: number;        // 0-5.0
  hours?: string;         // e.g., "24/7" or "9 AM - 6 PM"
}

interface NearbyLocationsResult {
  locations: Location[];
  error: string | null;
}
```

**Example:**
```tsx
function NearbyHospitals() {
  const [hospitals, setHospitals] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const { location, requestLocation } = useGeolocation();
  
  const handleLoadHospitals = async () => {
    setLoading(true);
    if (!location) {
      await requestLocation();
      return;
    }
    
    const result = await getNearbyLocations(
      location.latitude,
      location.longitude,
      5,
      'hospital'
    );
    
    if (!result.error) {
      setHospitals(result.locations);
    }
    setLoading(false);
  };
  
  return (
    <div>
      <button onClick={handleLoadHospitals} disabled={loading}>
        {loading ? 'Loading...' : 'Find Nearby Hospitals'}
      </button>
      
      <ul>
        {hospitals.map(hospital => (
          <li key={hospital.id}>
            <h3>{hospital.name}</h3>
            <p>{hospital.address}</p>
            <p>Distance: {hospital.distance?.toFixed(1)}km</p>
            <p>Rating: {hospital.rating}/5</p>
            <p>Hours: {hospital.hours}</p>
            <a href={`tel:${hospital.phone}`}>Call</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### locationsService.openInMaps()

**Purpose:** Open location in native or Google Maps

**Import:**
```tsx
import { openInMaps } from '@/services/locationsService';
```

**Signature:**
```tsx
function openInMaps(
  latitude: number,
  longitude: number,
  label?: string
): void
```

**Usage:**
```tsx
// Open in maps with coordinates
openInMaps(40.7128, -74.0060);

// Open with location label
openInMaps(40.7128, -74.0060, 'City Medical Center');
```

**Behavior:**
- iOS: Opens Apple Maps
- Android: Opens Google Maps
- Desktop: Opens Google Maps in new tab

**Example:**
```tsx
function GetDirections({ hospital }: { hospital: Location }) {
  return (
    <button 
      onClick={() => openInMaps(
        hospital.latitude, 
        hospital.longitude, 
        hospital.name
      )}
    >
      Get Directions
    </button>
  );
}
```

---

### locationsService.openInGoogleMaps()

**Purpose:** Always open in Google Maps (web)

**Import:**
```tsx
import { openInGoogleMaps } from '@/services/locationsService';
```

**Signature:**
```tsx
function openInGoogleMaps(
  latitude: number,
  longitude: number,
  label?: string
): void
```

**Usage:**
```tsx
openInGoogleMaps(40.7128, -74.0060, 'Hospital Name');
```

---

### locationsService.getGoogleMapsEmbedUrl()

**Purpose:** Get Google Maps embed URL for iframes

**Import:**
```tsx
import { getGoogleMapsEmbedUrl } from '@/services/locationsService';
```

**Signature:**
```tsx
function getGoogleMapsEmbedUrl(
  latitude: number,
  longitude: number,
  zoom?: number  // default: 15
): string
```

**Usage:**
```tsx
const embedUrl = getGoogleMapsEmbedUrl(40.7128, -74.0060, 15);

return (
  <iframe
    src={embedUrl}
    width="600"
    height="450"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
  />
);
```

---

## 🔍 Type Definitions

### Permission State
```tsx
type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unknown';
```

### Geolocation Coordinates
```tsx
interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;  // meters
}
```

### Location Type
```tsx
type LocationType = 'hospital' | 'clinic' | 'pharmacy' | 'emergency' | 'mental-health';
```

### Location Data
```tsx
interface Location {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating?: number;
  hours?: string;
}
```

---

## ⚠️ Error Handling

### Geolocation Errors
```tsx
const { location, error, requestLocation } = useGeolocation();

if (error) {
  if (error.includes('permission denied')) {
    // Guide user to enable location in settings
  } else if (error.includes('timeout')) {
    // Location took too long, retry
  } else if (error.includes('unavailable')) {
    // Location services disabled
  }
}
```

### Speech Recognition Errors
```tsx
const { error, isListening } = useSpeechRecognition();

if (error) {
  if (error.includes('no-speech')) {
    // No sound detected, user should try again
  } else if (error.includes('permission')) {
    // Guide user to enable mic in settings
  } else if (error.includes('network')) {
    // Internet connection issue
  }
}
```

### Permission Errors
```tsx
const { requestMicPermission, micPermission } = useMediaPermissions();

if (micPermission === 'denied') {
  // Guide user to settings
  // In iOS: Settings > Safari > Microphone
  // In Android: Settings > Apps > [App] > Permissions
}
```

---

## 🧪 Testing

### Testing useGeolocation
```tsx
// Mock navigator.geolocation
global.navigator.geolocation = {
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: { latitude: 40.7128, longitude: -74.0060, accuracy: 50 }
    });
  }),
};

const { location, requestLocation } = renderHook(() => useGeolocation());
await act(() => requestLocation());
expect(location.latitude).toBe(40.7128);
```

### Testing useSpeechRecognition
```tsx
// Mock Web Speech API
const mockRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  onresult: null,
};

global.SpeechRecognition = jest.fn(() => mockRecognition);

const { isListening, startListening } = renderHook(() => useSpeechRecognition());
startListening();
expect(mockRecognition.start).toHaveBeenCalled();
```

---

## 🚀 Performance Tips

### Location
- Use `requestLocation()` for one-time request (lower battery drain)
- Use `watchLocation()` only when needed
- Call `stopWatching()` when done
- Check accuracy before using coordinates

### Speech Recognition
- Call `stopListening()` after user finishes speaking
- Use `resetTranscript()` to clear old text
- Show interim results for real-time feedback
- Handle "no-speech" error gracefully

### Permissions
- Request only when user performs action (not on app load)
- Cache permission state to avoid re-requesting
- Call `releaseStream()` to prevent resource leaks
- Handle denied permissions gracefully

---

## 📱 Browser Compatibility

### useGeolocation
- Chrome 5+
- Firefox 3.5+
- Safari 5+
- Edge (all versions)
- Mobile browsers (all)

### useSpeechRecognition
- Chrome 25+
- Edge (all versions)
- Safari 14.1+
- Firefox: NOT supported (use fallback)
- Mobile: Supported on iOS 14.5+ and Android

### useMediaPermissions
- Chrome 44+
- Firefox 43+
- Safari 11+
- Edge (all versions)
- Mobile browsers (all)

---

**Last Updated:** January 25, 2026
**Version:** 2.0
**Status:** Complete
