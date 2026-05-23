import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { AnimatedTruck } from './animated-truck';
import { useLocation } from '@/lib/location-context';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  type: 'customer' | 'driver' | 'landmark';
  label: string;
  emoji: string;
}

interface CandyMapProps {
  showDriver?: boolean;
  showCustomer?: boolean;
  markers?: MapMarker[];
}

export function CandyMap({ showDriver = true, showCustomer = true, markers = [] }: CandyMapProps) {
  const { userLocation, driverLocation } = useLocation();
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>(markers);
  const screenWidth = Dimensions.get('window').width;
  const mapWidth = screenWidth - 48; // Account for padding
  const mapHeight = 400;

  // Generate random map markers (ice cream flavors)
  useEffect(() => {
    if (markers.length === 0) {
      const flavors = [
        { emoji: '🍦', label: 'Vanilla' },
        { emoji: '🍫', label: 'Chocolate' },
        { emoji: '🍓', label: 'Strawberry' },
        { emoji: '🍌', label: 'Banana' },
        { emoji: '🥝', label: 'Kiwi' },
        { emoji: '🍊', label: 'Orange' },
      ];

      const newMarkers: MapMarker[] = flavors.map((flavor, index) => ({
        id: `marker_${index}`,
        x: Math.random() * (mapWidth - 40),
        y: Math.random() * (mapHeight - 40),
        type: 'landmark',
        label: flavor.label,
        emoji: flavor.emoji,
      }));

      // Add customer location marker
      if (showCustomer) {
        newMarkers.push({
          id: 'customer',
          x: mapWidth / 2 - 20,
          y: mapHeight - 80,
          type: 'customer',
          label: 'You',
          emoji: '📍',
        });
      }

      // Add driver location marker
      if (showDriver) {
        newMarkers.push({
          id: 'driver',
          x: mapWidth / 3,
          y: mapHeight / 3,
          type: 'driver',
          label: 'Driver',
          emoji: '🚚',
        });
      }

      setMapMarkers(newMarkers);
    }
  }, [markers, showDriver, showCustomer, mapWidth, mapHeight]);

  return (
    <View className="rounded-2xl overflow-hidden border-2 border-primary shadow-lg">
      {/* Map Background - Candy Land Style */}
      <View
        style={{
          width: mapWidth,
          height: mapHeight,
          backgroundColor: '#FFB6D9', // Pastel pink
          position: 'relative',
        }}
      >
        {/* Decorative grid pattern */}
        <View className="absolute inset-0 opacity-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={`grid-h-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: '#8B4513',
                top: `${(i + 1) * 20}%`,
              }}
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={`grid-v-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: '#8B4513',
                left: `${(i + 1) * 20}%`,
              }}
            />
          ))}
        </View>

        {/* Map Markers */}
        {mapMarkers.map((marker) => (
          <View
            key={marker.id}
            style={{
              position: 'absolute',
              left: marker.x,
              top: marker.y,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: marker.type === 'driver' ? 10 : 5,
            }}
          >
            {marker.type === 'driver' ? (
              <AnimatedTruck x={0} y={0} heading={45} />
            ) : (
              <View className="items-center">
                <Text className="text-2xl">{marker.emoji}</Text>
                <Text className="text-xs font-bold text-foreground mt-1">{marker.label}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Compass */}
        <View className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white border-2 border-primary items-center justify-center shadow-md">
          <Text className="text-xl">🧭</Text>
        </View>
      </View>

      {/* Map Legend */}
      <View className="bg-surface p-3 border-t border-border">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">📍</Text>
            <Text className="text-xs text-muted">Your Location</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">🚚</Text>
            <Text className="text-xs text-muted">Ice Cream Truck</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">🍦</Text>
            <Text className="text-xs text-muted">Flavors</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
