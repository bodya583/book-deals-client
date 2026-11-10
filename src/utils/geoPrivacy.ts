/**
 * Geo Privacy & Spatial Cloaking Utilities for P2P Book Exchange
 * Protects user home addresses against trilateration and exact location harvesting.
 */

const CITY_COORDINATES: Record<string, [number, number]> = {
  киев: [50.4501, 30.5234],
  київ: [50.4501, 30.5234],
  львов: [49.8397, 24.0297],
  львів: [49.8397, 24.0297],
  одесса: [46.4825, 30.7233],
  одеса: [46.4825, 30.7233],
  харьков: [49.9935, 36.2304],
  харків: [49.9935, 36.2304],
  днепр: [48.4647, 35.0462],
  дніпро: [48.4647, 35.0462],
  запорожье: [47.8388, 35.1396],
  запоріжжя: [47.8388, 35.1396],
};

/**
 * Deterministic pseudo-random float in [-1, 1] based on a seed string and salt.
 */
function hashToNormalizedFloat(seedStr: string, salt: number): number {
  let hash = salt;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 37 + seedStr.charCodeAt(i)) % 1000003;
  }
  return (hash % 10000) / 5000 - 1; // [-1.0, 1.0]
}

/**
 * Spatial Cloaking: applies a deterministic obfuscation jitter (~500m - 800m)
 * to coordinates based on the book's unique identifier.
 * Ensures the exact roof/house coordinates are never exposed on map or in API responses.
 */
export function cloakCoordinates(
  lat: number,
  lng: number,
  bookId: string
): [number, number] {
  // ~600m latitude offset (1 deg ≈ 111 km -> 0.0055 deg ≈ 610 m)
  const latJitter = hashToNormalizedFloat(bookId, 1729) * 0.0055;
  // ~600m longitude offset at ~50° latitude (1 deg ≈ 71 km -> 0.0085 deg ≈ 600 m)
  const lngJitter = hashToNormalizedFloat(bookId, 9973) * 0.0085;

  return [Number((lat + latJitter).toFixed(5)), Number((lng + lngJitter).toFixed(5))];
}

/**
 * Resolves base coordinates for a book from its owner or city fallback.
 */
export function resolveBookBaseCoordinates(
  owner?: { latitude?: number | null; longitude?: number | null; city?: string | null } | null
): [number, number] | null {
  if (owner?.latitude != null && owner?.longitude != null) {
    return [owner.latitude, owner.longitude];
  }

  if (owner?.city) {
    const normCity = owner.city.trim().toLowerCase();
    if (CITY_COORDINATES[normCity]) {
      return CITY_COORDINATES[normCity];
    }
  }

  // Fallback to default Kyiv coordinate center
  return [50.4501, 30.5234];
}

/**
 * Calculate Great-Circle distance between two points in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
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
 * Discrete Distance Bucketing (Differential Privacy against Trilateration).
 * Rather than displaying exact metrics (e.g. 842 meters), distance is displayed in safe ranges.
 */
export function getDiscreteDistanceLabel(distanceKm: number | null | undefined): string {
  if (distanceKm == null || isNaN(distanceKm)) {
    return 'В вашем городе';
  }

  if (distanceKm < 1) {
    return 'Поблизости (< 1 км)';
  }
  if (distanceKm < 3.5) {
    return '~2–3 км от вас';
  }
  if (distanceKm < 6.5) {
    return '~5 км от вас';
  }
  if (distanceKm < 12) {
    return '~10 км от вас';
  }

  const rounded = Math.round(distanceKm / 5) * 5;
  return `~${rounded} км от вас`;
}
