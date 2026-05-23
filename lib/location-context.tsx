import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

// Export as Location for backward compatibility
export type { LocationData as Location };

export interface DriverLocation extends LocationData {
  driverId: string;
  timestamp: number;
}

interface LocationContextType {
  userLocation: LocationData | null;
  driverLocation: DriverLocation | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  setUserLocation: (location: LocationData) => void;
  setDriverLocation: (location: DriverLocation) => void;
  requestLocationPermission: () => Promise<boolean>;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => void;
  retryLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Reverse geocode using free Nominatim API
async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TheIceCreamManApp/1.0',
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.address) {
        const parts: string[] = [];
        if (data.address.road) parts.push(data.address.road);
        if (data.address.city || data.address.town || data.address.village) {
          parts.push(data.address.city || data.address.town || data.address.village);
        }
        if (data.address.state) parts.push(data.address.state);
        if (parts.length > 0) return parts.join(', ');
      }
      if (data.display_name) {
        // Shorten the display name
        const parts = data.display_name.split(',').slice(0, 3);
        return parts.join(',').trim();
      }
    }
  } catch (error) {
    console.log('Reverse geocoding failed, using coordinates:', error);
  }
  return `${latitude.toFixed(4)}°N, ${Math.abs(longitude).toFixed(4)}°W`;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const trackingIntervalRef = useRef<any>(null);
  const locationSubRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Web: check if geolocation is available
        if (!navigator.geolocation) {
          setLocationError('Geolocation is not supported by this browser');
          return false;
        }
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                setLocationError('Location permission denied. Please enable location in your browser settings.');
              } else if (error.code === error.POSITION_UNAVAILABLE) {
                setLocationError('Location unavailable. Please check your device settings.');
              } else {
                setLocationError('Location request timed out. Please try again.');
              }
              resolve(false);
            },
            { timeout: 10000 }
          );
        });
      }

      // Native: use expo-location
      const ExpoLocation = require('expo-location');
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable in Settings.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to request location permission:', error);
      setLocationError('Failed to request location permission');
      return false;
    }
  };

  // Get current location once
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          setLocationError('Geolocation not supported');
          return null;
        }

        return new Promise<LocationData | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              
              // Reverse geocode to get readable address
              const address = await reverseGeocode(lat, lon);
              
              resolve({
                latitude: lat,
                longitude: lon,
                accuracy: position.coords.accuracy ?? undefined,
                heading: position.coords.heading ?? undefined,
                speed: position.coords.speed ?? undefined,
                address,
              });
            },
            (error) => {
              console.error('Geolocation error:', error.message);
              if (error.code === error.PERMISSION_DENIED) {
                setLocationError('Location access denied. Please allow location in browser settings.');
              } else if (error.code === error.POSITION_UNAVAILABLE) {
                setLocationError('Unable to determine location. Check device GPS.');
              } else {
                setLocationError('Location request timed out.');
              }
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 30000,
            }
          );
        });
      }

      // Native: use expo-location
      const ExpoLocation = require('expo-location');
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      const address = await reverseGeocode(lat, lon);

      return {
        latitude: lat,
        longitude: lon,
        accuracy: location.coords.accuracy ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
        address,
      };
    } catch (error) {
      console.error('getCurrentLocation error:', error);
      setLocationError('Failed to get location. Please try again.');
      return null;
    }
  };

  // Start continuous location tracking
  const startLocationTracking = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsLoadingLocation(false);
        return;
      }

      // Get initial location
      const initialLocation = await getCurrentLocation();
      if (initialLocation && isMountedRef.current) {
        setUserLocation(initialLocation);
        setLocationError(null);
      }
      
      if (isMountedRef.current) {
        setIsLoadingLocation(false);
      }

      if (Platform.OS === 'web') {
        // For web, use watchPosition for continuous updates
        if (navigator.geolocation) {
          const watchId = navigator.geolocation.watchPosition(
            async (position) => {
              if (!isMountedRef.current) return;
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              const address = await reverseGeocode(lat, lon);
              
              setUserLocation({
                latitude: lat,
                longitude: lon,
                accuracy: position.coords.accuracy ?? undefined,
                heading: position.coords.heading ?? undefined,
                speed: position.coords.speed ?? undefined,
                address,
              });
              setLocationError(null);
            },
            (error) => {
              console.error('Watch position error:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            }
          );
          trackingIntervalRef.current = watchId;
        }
      } else {
        // For native, use expo-location subscription
        const ExpoLocation = require('expo-location');
        const subscription = await ExpoLocation.watchPositionAsync(
          {
            accuracy: ExpoLocation.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          async (location: any) => {
            if (!isMountedRef.current) return;
            const lat = location.coords.latitude;
            const lon = location.coords.longitude;
            const address = await reverseGeocode(lat, lon);
            
            setUserLocation({
              latitude: lat,
              longitude: lon,
              accuracy: location.coords.accuracy ?? undefined,
              heading: location.coords.heading ?? undefined,
              speed: location.coords.speed ?? undefined,
              address,
            });
            setLocationError(null);
          }
        );
        locationSubRef.current = subscription;
      }
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      if (isMountedRef.current) {
        setLocationError('Failed to start location tracking. Please try again.');
        setIsLoadingLocation(false);
      }
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (Platform.OS === 'web' && trackingIntervalRef.current !== null) {
      navigator.geolocation.clearWatch(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
  };

  // Retry location
  const retryLocation = () => {
    stopLocationTracking();
    startLocationTracking();
  };

  // Start tracking on mount
  useEffect(() => {
    isMountedRef.current = true;
    startLocationTracking();
    return () => {
      isMountedRef.current = false;
      stopLocationTracking();
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        driverLocation,
        isLoadingLocation,
        locationError,
        setUserLocation,
        setDriverLocation,
        requestLocationPermission,
        startLocationTracking,
        stopLocationTracking,
        retryLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
