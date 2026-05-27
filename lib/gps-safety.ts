/**
 * GPS Safety Zone Utilities
 * 
 * Ensures drivers navigate only within a 1000-foot safety zone of the customer's
 * saved location. This protects customer privacy (exact address not shared) while
 * keeping drivers from wandering too far into neighborhoods.
 */

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// 1000 feet in meters
export const SAFETY_ZONE_RADIUS_METERS = 304.8; // ~1000 feet

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  from: LocationCoords,
  to: LocationCoords
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if driver's current location is within the safety zone
 * Returns true if within 1000 feet, false if outside
 */
export function isWithinSafetyZone(
  driverLocation: LocationCoords,
  customerLocation: LocationCoords
): boolean {
  const distance = calculateDistance(driverLocation, customerLocation);
  return distance <= SAFETY_ZONE_RADIUS_METERS;
}

/**
 * Get distance in feet for display
 */
export function getDistanceInFeet(meters: number): number {
  return Math.round(meters * 3.28084);
}

/**
 * Format distance for user display
 */
export function formatDistance(meters: number): string {
  const feet = getDistanceInFeet(meters);
  if (feet < 100) {
    return `${feet} ft away`;
  } else if (feet < 1000) {
    return `${Math.round(feet / 100) * 100} ft away`;
  } else {
    const miles = (feet / 5280).toFixed(1);
    return `${miles} miles away`;
  }
}

/**
 * Get a random point within the safety zone for privacy
 * This gives the driver a target location within 1000 feet instead of exact address
 */
export function getRandomPointInSafetyZone(
  center: LocationCoords
): LocationCoords {
  // Generate random point within circle using uniform distribution
  const angle = Math.random() * 2 * Math.PI;
  const radius = Math.sqrt(Math.random()) * SAFETY_ZONE_RADIUS_METERS;

  // Convert meters to degrees (rough approximation)
  const latOffset = (radius / 111000) * Math.cos(angle);
  const lonOffset = (radius / (111000 * Math.cos((center.latitude * Math.PI) / 180))) * Math.sin(angle);

  return {
    latitude: center.latitude + latOffset,
    longitude: center.longitude + lonOffset,
  };
}
