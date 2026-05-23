import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useLocation } from '@/lib/location-context';

export default function CustomerHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { userLocation } = useLocation();
  const [requestStatus, setRequestStatus] = useState<'idle' | 'waiting' | 'accepted'>('idle');
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const createRequestMutation = trpc.requests.create.useMutation();

  const handleBigIceCreamPress = async () => {
    try {
      if (!userLocation) {
        Alert.alert('Error', 'Could not get your location. Please try again.');
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setRequestStatus('waiting');

      // Call backend API to create request
      await createRequestMutation.mutateAsync({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address,
      });

      // Simulate driver acceptance after 3 seconds
      setTimeout(() => {
        setRequestStatus('accepted');
        setEstimatedTime(12);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 3000);
    } catch (error) {
      console.error('Failed to send request:', error);
      setRequestStatus('idle');
      Alert.alert('Error', 'Failed to send request. Please try again.');
    }
  };

  const handleCancelRequest = () => {
    setRequestStatus('idle');
    setEstimatedTime(null);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-6 justify-between">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">🍦 Ice Cream Man</Text>
            <Text className="text-sm text-muted">Your neighborhood, your choice</Text>
          </View>

          {/* Status Section */}
          {requestStatus !== 'idle' && (
            <View className="bg-surface rounded-2xl p-6 border-2 border-primary">
              <Text className="text-lg font-semibold text-foreground mb-2">
                {requestStatus === 'waiting' ? '⏳ Waiting for driver...' : '✅ Driver accepted!'}
              </Text>
              {estimatedTime && (
                <Text className="text-sm text-muted mb-4">
                  Estimated arrival: {estimatedTime} minutes
                </Text>
              )}
              <Pressable
                onPress={handleCancelRequest}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <View className="bg-error rounded-lg p-3">
                  <Text className="text-white font-semibold text-center">Cancel Request</Text>
                </View>
              </Pressable>
            </View>
          )}

          {/* Big Ice Cream Button */}
          <View className="flex-1 justify-center items-center">
            <Pressable
              onPress={handleBigIceCreamPress}
              disabled={requestStatus !== 'idle' || createRequestMutation.isPending}
              style={({ pressed }) => [
                {
                  opacity: requestStatus !== 'idle' ? 0.5 : pressed ? 0.9 : 1,
                  transform: [{ scale: pressed && requestStatus === 'idle' ? 0.95 : 1 }],
                },
              ]}
            >
              <View className="w-32 h-32 rounded-full bg-primary items-center justify-center shadow-lg">
                <Text className="text-7xl">🍦</Text>
              </View>
            </Pressable>
            <Text className="text-center mt-6 text-base font-semibold text-foreground">
              {requestStatus === 'idle' ? 'Tap to order ice cream!' : 'Request sent'}
            </Text>
          </View>

          {/* Quick Info */}
          <View className="gap-3">
            <View className="bg-surface rounded-lg p-4 flex-row items-center gap-3">
              <Text className="text-2xl">📍</Text>
              <View className="flex-1">
                <Text className="text-xs text-muted">Current Location</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {userLocation?.address || 'Your Neighborhood'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/(customer)/map')}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-primary rounded-lg p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">🗺️</Text>
                  <View>
                    <Text className="text-xs text-white opacity-80">View Live Map</Text>
                    <Text className="text-sm font-semibold text-white">Track your driver</Text>
                  </View>
                </View>
                <Text className="text-xl">→</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
