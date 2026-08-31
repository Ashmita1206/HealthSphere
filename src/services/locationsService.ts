// services/locationsService.ts
import { api } from '@/services/api';

export type FacilityType = 'hospital' | 'pharmacy' | 'clinic' | 'blood_bank';

export interface Location {
  id: string;
  name: string;
  type: FacilityType;
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
 * Get user's current location using browser Geolocation API
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
 * Generic facility query supporting hospitals, pharmacies, clinics, and blood banks.
 */
export async function getNearbyFacilities(
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000,
  facilityType: FacilityType = 'hospital',
): Promise<NearbyLocationsResult> {
  try {
    const query = new URLSearchParams({
      lat: String(userLat),
      lng: String(userLng),
      radius: String(radiusMeters),
      type: facilityType,
    });

    const result = await api.get<NearbyLocationsResult>(`/emergency/nearby?${query}`);
    return result;
  } catch (error) {
    return {
      locations: [],
      error: error instanceof Error ? error.message : `Unable to load ${facilityType} locations`,
    };
  }
}

/**
 * Fetch nearby hospitals using OpenStreetMap (Overpass API)
 * Backward-compatible wrapper around getNearbyFacilities.
 */
export async function getNearbyHospitals(
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000,
): Promise<NearbyLocationsResult> {
  return getNearbyFacilities(userLat, userLng, radiusMeters, 'hospital');
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
