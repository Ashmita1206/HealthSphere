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

    // Helper that performs fetch with timeout using AbortController
    const fetchWithTimeout = async (url: string, timeoutMs = 8000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { method: 'POST', body: query, signal: controller.signal });
        return res;
      } finally {
        clearTimeout(id);
      }
    };

    // Use reliable Overpass endpoints. Avoid calling overpass-api.de to prevent
    // frequent 504 Gateway Timeout errors observed in some regions.
    const endpoints = [
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass.openstreetmap.fr/api/interpreter',
    ];

    let response: Response | null = null;
    let lastError: any = null;
    for (const url of endpoints) {
      try {
        response = await fetchWithTimeout(url, 8000);
        if (response && response.ok) break;
      } catch (err) {
        lastError = err;
        response = null;
        // try next endpoint
      }
    }

    if (!response) {
      throw new Error('Overpass API request failed or timed out');
    }

    if (!response || !response.ok) {
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
