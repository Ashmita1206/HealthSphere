export interface Location {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "pharmacy" | "emergency" | "mental-health";
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating?: number;
  hours?: string;
}

export interface NearbyLocationsResult {
  locations: Location[];
  error: string | null;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Mock database of nearby locations
 * In production, this would be fetched from a real API or Supabase
 */
const MOCK_LOCATIONS: Location[] = [
  {
    id: "h1",
    name: "City Medical Center",
    type: "hospital",
    address: "123 Health Avenue, Downtown",
    phone: "555-0100",
    latitude: 40.7128,
    longitude: -74.006,
    rating: 4.7,
    hours: "24/7",
  },
  {
    id: "h2",
    name: "County General Hospital",
    type: "hospital",
    address: "456 Medical Boulevard, Midtown",
    phone: "555-0200",
    latitude: 40.7489,
    longitude: -73.968,
    rating: 4.5,
    hours: "24/7",
  },
  {
    id: "c1",
    name: "Urgent Care Clinic",
    type: "clinic",
    address: "789 Health Street, Uptown",
    phone: "555-0300",
    latitude: 40.7614,
    longitude: -73.9776,
    rating: 4.6,
    hours: "8 AM - 10 PM",
  },
  {
    id: "p1",
    name: "24/7 Pharmacy Plus",
    type: "pharmacy",
    address: "321 Medicine Lane, Downtown",
    phone: "555-0400",
    latitude: 40.71,
    longitude: -74.0,
    rating: 4.4,
    hours: "24/7",
  },
  {
    id: "e1",
    name: "Emergency Care Center",
    type: "emergency",
    address: "654 Emergency Road, East Side",
    phone: "911",
    latitude: 40.758,
    longitude: -73.9855,
    rating: 4.8,
    hours: "24/7",
  },
  {
    id: "m1",
    name: "Mental Health Services",
    type: "mental-health",
    address: "987 Wellness Avenue, West Side",
    phone: "555-0500",
    latitude: 40.7282,
    longitude: -74.0076,
    rating: 4.5,
    hours: "9 AM - 6 PM",
  },
];

export async function getNearbyLocations(
  userLat: number,
  userLon: number,
  radiusKm: number = 5,
  type?: Location["type"]
): Promise<NearbyLocationsResult> {
  try {
    // Filter locations within radius
    let filtered = MOCK_LOCATIONS.filter((location) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        location.latitude,
        location.longitude
      );

      return distance <= radiusKm;
    });

    // Filter by type if specified
    if (type) {
      filtered = filtered.filter((location) => location.type === type);
    }

    // Calculate and sort by distance
    filtered = filtered
      .map((location) => ({
        ...location,
        distance: calculateDistance(
          userLat,
          userLon,
          location.latitude,
          location.longitude
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return {
      locations: filtered,
      error: null,
    };
  } catch (error) {
    return {
      locations: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Open location in Google Maps (works on all devices)
 */
export function openInGoogleMaps(
  latitude: number,
  longitude: number,
  label?: string
): void {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}${label ? `&q=${label}` : ""}`;
  window.open(url, "_blank");
}

/**
 * Open Apple Maps (iOS) or Google Maps (Android/Web)
 */
export function openInMaps(
  latitude: number,
  longitude: number,
  label?: string
): void {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    const url = `maps://maps.apple.com/?daddr=${latitude},${longitude}${label ? `&q=${label}` : ""}`;
    window.open(url, "_blank");
  } else {
    openInGoogleMaps(latitude, longitude, label);
  }
}

/**
 * Generate Google Maps URL for embedding
 */
export function getGoogleMapsEmbedUrl(
  latitude: number,
  longitude: number,
  zoom: number = 15
): string {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=${zoom}`;
}
