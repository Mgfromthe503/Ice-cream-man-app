import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useLocation } from '@/lib/location-context';
import { RatingsPrompt } from '@/components/ratings-prompt';

export default function CustomerHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { userLocation, isLoadingLocation, locationError } = useLocation();
  const [requestStatus, setRequestStatus] = useState<'idle' | 'waiting' | 'accepted' | 'arrived' | 'completed'>('idle');
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [driverName, setDriverName] = useState('your Ice Cream Man');
  const createRequestMutation = trpc.requests.create.useMutation();

  const handleBigIceCreamPress = async () => {
    try {
      if (!userLocation) {
        Alert.alert(
          'Location Needed',
          'We need your location to send an ice cream truck to you. Please enable location services and try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setRequestStatus('waiting');

      // Call backend API to create request
      await createRequestMutation.mutateAsync({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
      });

      // Simulate driver acceptance after 3 seconds (in production this would be a real-time update)
      setTimeout(() => {
        setRequestStatus('accepted');
        setEstimatedTime(12);
        setDriverName('Ice Cream Mike');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 3000);

      // Simulate arrival after 15 seconds
      setTimeout(() => {
        setRequestStatus('arrived');
        setEstimatedTime(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 15000);
    } catch (error) {
      console.error('Failed to send request:', error);
      setRequestStatus('idle');
      Alert.alert('Error', 'Failed to send request. Please try again.');
    }
  };

  const handleDeliveryComplete = () => {
    setRequestStatus('completed');
    // Show the rating prompt for the ICE CREAM MAN
    setShowRating(true);
  };

  const handleCancelRequest = () => {
    setRequestStatus('idle');
    setEstimatedTime(null);
  };

  const handleRatingClose = () => {
    setShowRating(false);
    setRequestStatus('idle');
  };

  // Format location display
  const getLocationDisplay = () => {
    if (isLoadingLocation) return 'Finding your location...';
    if (locationError) return 'Location unavailable - tap to retry';
    if (userLocation?.address) return userLocation.address;
    if (userLocation) return `${userLocation.latitude.toFixed(4)}°N, ${userLocation.longitude.toFixed(4)}°W`;
    return 'Enable location to order';
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-6 justify-between">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">🍦 Ice Cream Man</Text>
            <Text className="text-sm text-muted">Tap the cone to summon your ice cream truck!</Text>
          </View>

          {/* Location Status */}
          <View className="bg-surface rounded-xl p-4 flex-row items-center gap-3 border border-border">
            <Text className="text-2xl">📍</Text>
            <View className="flex-1">
              <Text className="text-xs text-muted">Your Location</Text>
              <Text className="text-sm font-semibold text-foreground">
                {getLocationDisplay()}
              </Text>
              {userLocation?.accuracy && (
                <Text className="text-xs text-success mt-1">
                  GPS Active (±{Math.round(userLocation.accuracy)}m)
                </Text>
              )}
              {locationError && (
                <Text className="text-xs text-error mt-1">{locationError}</Text>
              )}
            </View>
            {isLoadingLocation && <Text className="text-lg">⏳</Text>}
            {userLocation && !isLoadingLocation && <Text className="text-lg">✅</Text>}
          </View>

          {/* Status Section - Only show when request is active */}
          {requestStatus !== 'idle' && requestStatus !== 'completed' && (
            <View className="bg-surface rounded-2xl p-6 border-2 border-primary">
              <Text className="text-lg font-semibold text-foreground mb-2">
                {requestStatus === 'waiting' && '⏳ Finding an ice cream truck...'}
                {requestStatus === 'accepted' && '🚚 Ice Cream Man is on the way!'}
                {requestStatus === 'arrived' && '🎉 Ice Cream Man is HERE!'}
              </Text>
              {estimatedTime && (
                <Text className="text-sm text-muted mb-2">
                  Estimated arrival: {estimatedTime} minutes
                </Text>
              )}
              {requestStatus === 'accepted' && (
                <Text className="text-sm text-primary font-semibold mb-4">
                  Driver: {driverName}
                </Text>
              )}
              {requestStatus === 'arrived' && (
                <Pressable
                  onPress={handleDeliveryComplete}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <View className="bg-success rounded-lg p-3 mb-3">
                    <Text className="text-white font-semibold text-center">Got My Ice Cream! 🍦</Text>
                  </View>
                </Pressable>
              )}
              {requestStatus !== 'arrived' && (
                <Pressable
                  onPress={handleCancelRequest}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <View className="bg-error rounded-lg p-3">
                    <Text className="text-white font-semibold text-center">Cancel Request</Text>
                  </View>
                </Pressable>
              )}
            </View>
          )}

          {/* Big Ice Cream Button - MASSIVE and centered */}
          <View className="flex-1 justify-center items-center py-4">
            <Pressable
              onPress={handleBigIceCreamPress}
              disabled={requestStatus !== 'idle' || createRequestMutation.isPending || !userLocation}
              style={({ pressed }) => [
                {
                  opacity: (requestStatus !== 'idle' || !userLocation) ? 0.4 : pressed ? 0.85 : 1,
                  transform: [{ scale: pressed && requestStatus === 'idle' ? 0.92 : 1 }],
                },
              ]}
            >
              <View
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: 120,
                  backgroundColor: '#FF69B4',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 6,
                  borderColor: '#FF1493',
                  shadowColor: '#FF69B4',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <Text style={{ fontSize: 100 }}>🍦</Text>
              </View>
            </Pressable>
            <Text className="text-center mt-6 text-2xl font-bold text-foreground">
              {requestStatus === 'idle' ? '🎉 TAP TO ORDER!' : ''}
              {requestStatus === 'waiting' ? '🔍 Searching...' : ''}
              {requestStatus === 'accepted' ? '🚚 On the way!' : ''}
              {requestStatus === 'arrived' ? '🎊 They\'re here!' : ''}
            </Text>
            {requestStatus === 'idle' && !userLocation && (
              <Text className="text-center mt-2 text-sm text-error">
                Enable location to order ice cream
              </Text>
            )}
            {requestStatus === 'idle' && userLocation && (
              <Text className="text-center mt-2 text-sm text-muted">
                One tap brings the ice cream truck to you!
              </Text>
            )}
          </View>

          {/* View Map Button */}
          <Pressable
            onPress={() => router.push('/(customer)/map')}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <View className="bg-primary rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">🗺️</Text>
                <View>
                  <Text className="text-xs text-white opacity-80">View Live Map</Text>
                  <Text className="text-sm font-semibold text-white">Track your ice cream truck</Text>
                </View>
              </View>
              <Text className="text-xl text-white">→</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Rating prompt - shows AFTER delivery to rate the ICE CREAM MAN */}
      <RatingsPrompt
        visible={showRating}
        driverName={driverName}
        onClose={handleRatingClose}
        onRatingSubmitted={(rating) => {
          console.log(`Customer rated ${driverName}: ${rating} stars`);
        }}
      />
    </ScreenContainer>
  );
}
