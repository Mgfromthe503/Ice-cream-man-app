import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// Try to import expo-location, but provide fallback for web
let Location: any = null;
try {
  if (Platform.OS !== 'web') {
    Location = require('expo-location');
  }
} catch (e) {
  // expo-location not available on web
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

// Export as Location for backward compatibility
export type Location = LocationData;

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
  const locationSubscriptionRef = useRef<any>(null);
  const trackingIntervalRef = useRef<any>(null);

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Web uses browser geolocation API
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

      if (!Location) {
        return false;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request location permission:', error);
      setLocationError('Failed to request location permission');
      return false;
    }
  };

  // Get current location once
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      setLocationError(null);

      if (Platform.OS === 'web') {
        // Use browser geolocation API for web
        return new Promise<LocationData>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              resolve({
                latitude,
                longitude,
                accuracy,
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
              reject(error);
            }
          );
        });
      }

      if (!Location) {
        throw new Error('Location module not available');
      }

      // Use expo-location for native
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy, heading, speed } = location.coords;

      return {
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      setLocationError('Failed to get current location');
      throw error;
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
            console.error('Error updating location:', error);
          }
        }, 5000);
      } else if (Location) {
        // For native, use location subscription for real-time updates
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Or when moved 10 meters
          },
          (location: any) => {
            const { latitude, longitude, accuracy, heading, speed } = location.coords;
            setUserLocation({
              latitude,
              longitude,
              accuracy,
              heading,
              speed,
            });
            setLocationError(null);
          }
        );

        locationSubscriptionRef.current = subscription;
      }
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      setLocationError('Failed to start location tracking');
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
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
