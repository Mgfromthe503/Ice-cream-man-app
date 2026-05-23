import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DriverLocation extends Location {
  driverId: string;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface LocationContextType {
  userLocation: Location | null;
  driverLocation: DriverLocation | null;
  isLoadingLocation: boolean;
  setUserLocation: (location: Location) => void;
  setDriverLocation: (location: DriverLocation) => void;
  requestLocationPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Mock location for demo purposes
  useEffect(() => {
    // Set a default location (San Francisco area for demo)
    setUserLocation({
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'San Francisco, CA',
    });
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      // TODO: Implement actual location permission request using expo-location
      // For now, return true to indicate permission granted
      return true;
    } catch (error) {
      console.error('Failed to request location permission:', error);
      return false;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        driverLocation,
        isLoadingLocation,
        setUserLocation,
        setDriverLocation,
        requestLocationPermission,
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
