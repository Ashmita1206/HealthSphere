// services/locationService.ts

export interface Location {
  id: string;
  name: string;
  type: 'hospital';
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
 * Get user's current location using browser Geolocation API (FREE)
 */
export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => reject('Location permission denied'),
      { enableHighAccuracy: true },
    );
  });
}

/**
 * Fetch nearby hospitals using OpenStreetMap (Overpass API)
 * radius is in METERS
 */
export async function getNearbyHospitals(
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000,
): Promise<NearbyLocationsResult> {
  try {
    const radiusKm = radiusMeters / 1000;

    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radiusMeters},${userLat},${userLng});
        way["amenity"="hospital"](around:${radiusMeters},${userLat},${userLng});
        relation["amenity"="hospital"](around:${radiusMeters},${userLat},${userLng});
      );
      out center tags;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hospitals');
    }

    const data = await response.json();

    const hospitals: Location[] = data.elements.map((el: any) => ({
      id: String(el.id),
      name: el.tags?.name || 'Unnamed Hospital',
      type: 'hospital',
      address:
        el.tags?.['addr:full'] ||
        el.tags?.['addr:street'] ||
        el.tags?.address ||
        '',
      phone: el.tags?.phone || '',
      latitude: el.lat || el.center?.lat,
      longitude: el.lon || el.center?.lon,
    }));

    return {
      locations: hospitals,
      error: null,
    };
  } catch (error) {
    return {
      locations: [],
      error:
        error instanceof Error ? error.message : 'Unable to load hospitals',
    };
  }
}

/**
 * Open location in OpenStreetMap
 */
export function openInMaps(
  latitude: number,
  longitude: number,
  label?: string,
): void {
  const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;
  window.open(url, '_blank');
}
