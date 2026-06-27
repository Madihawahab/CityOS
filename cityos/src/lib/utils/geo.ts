// ─── CityOS Geolocation Utilities ────────────────────────────────────────────

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula (in metres)
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371000; // Earth radius in metres
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;

  const aVal =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
}

/**
 * Get current position as a Promise
 */
export function getCurrentPosition(
  options?: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options,
    });
  });
}

/**
 * Default map center — Bengaluru city center
 */
export const BENGALURU_CENTER: LatLng = {
  latitude: 12.9716,
  longitude: 77.5946,
};

/**
 * Default map bounds for Bengaluru
 */
export const BENGALURU_BOUNDS = {
  north: 13.15,
  south: 12.85,
  east: 77.78,
  west: 77.45,
};

/**
 * Default zoom levels
 */
export const MAP_ZOOM = {
  city: 11,
  ward: 13,
  street: 15,
  detail: 17,
} as const;

/**
 * Check if coordinates are within Bengaluru bounds
 */
export function isWithinBengaluru(coords: LatLng): boolean {
  return (
    coords.latitude >= BENGALURU_BOUNDS.south &&
    coords.latitude <= BENGALURU_BOUNDS.north &&
    coords.longitude >= BENGALURU_BOUNDS.west &&
    coords.longitude <= BENGALURU_BOUNDS.east
  );
}

/**
 * Format coordinates for display
 */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
