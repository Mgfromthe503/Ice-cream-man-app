import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

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
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const trackingIntervalRef = useRef<any>(null);
  const locationSubRef = useRef<any>(null);

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false)
            );
          } else {
            resolve(false);
          }
        });
      }

      // Native: use expo-location
      const ExpoLocation = require('expo-location');
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request location permission:', error);
      setLocationError('Failed to request location permission');
      return false;
    }
  };

  // Get current location once
  const getCurrentLocation = async (): Promise<LocationData> => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      if (Platform.OS === 'web') {
        return new Promise<LocationData>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy ?? undefined,
                heading: position.coords.heading ?? undefined,
                speed: position.coords.speed ?? undefined,
              });
            },
            (error) => {
              reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      }

      // Native: use expo-location
      const ExpoLocation = require('expo-location');
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
      };
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Start continuous location tracking
  const startLocationTracking = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocationError('Location permission denied');
        return;
      }

      // Get initial location
      const initialLocation = await getCurrentLocation();
      setUserLocation(initialLocation);

      if (Platform.OS === 'web') {
        // For web, poll location every 5 seconds
        trackingIntervalRef.current = setInterval(async () => {
          try {
            const location = await getCurrentLocation();
            setUserLocation(location);
          } catch (error) {
            // Silently fail on polling errors
          }
        }, 5000);
      } else {
        // For native, use expo-location subscription
        const ExpoLocation = require('expo-location');
        const subscription = await ExpoLocation.watchPositionAsync(
          {
            accuracy: ExpoLocation.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location: any) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy ?? undefined,
              heading: location.coords.heading ?? undefined,
              speed: location.coords.speed ?? undefined,
            });
            setLocationError(null);
          }
        );
        locationSubRef.current = subscription;
      }
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      setLocationError('Failed to start location tracking');
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationSubRef.current) {
      locationSubRef.current.remove();
      locationSubRef.current = null;
    }
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  };

  // Start tracking on mount
  useEffect(() => {
    startLocationTracking();
    return () => {
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
