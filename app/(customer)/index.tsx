import { View, Text, Pressable, ScrollView, Alert, Animated, Easing } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useLocation } from '@/lib/location-context';
import { RatingsPrompt } from '@/components/ratings-prompt';
import { SummoningAnimation } from '@/components/summoning-animation';
import { DriversWantedBanner } from '@/components/drivers-wanted-banner';
import { ETADisplay } from '@/components/eta-messaging';
import { useAudioPlayer } from 'expo-audio';
import { FactTicker } from '@/components/fact-ticker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isWithinSafetyZone, calculateDistance, formatDistance } from '@/lib/gps-safety';

// Short jingle snippet for arrival notification
const arrivalJingleSource = require('../../assets/ice-cream-jingle-short.mp3');

export default function CustomerHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { userLocation, isLoadingLocation, locationError } = useLocation();
  const [requestStatus, setRequestStatus] = useState<'idle' | 'summoning' | 'searching' | 'accepted' | 'nearby' | 'arrived' | 'completed'>('idle');
  const [driverCheckpoint, setDriverCheckpoint] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);

  // Arrival jingle - plays once when driver arrives
  const arrivalPlayer = useAudioPlayer(arrivalJingleSource);
  const arrivalPlayedRef = useRef(false);
  const [driverName, setDriverName] = useState('your Ice Cream Man');
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distanceToCustomer, setDistanceToCustomer] = useState<number | null>(null);
  const createRequestMutation = trpc.requests.create.useMutation();

  // Pulsing glow animation for the big button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (requestStatus !== 'idle') return;
    // Continuous pulse to draw attention
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    glow.start();
    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [requestStatus]);

  const handleBigIceCreamPress = async () => {
    try {
      // Prevent multiple presses while already summoning (prevents jingle stacking)
      if (requestStatus !== 'idle') return;

      if (!userLocation) {
        Alert.alert(
          'Location Needed 📍',
          'We need your location to send an ice cream truck to you! Please enable location services.',
          [{ text: 'OK' }]
        );
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Safety reminder on first order
      const hasSeenSafety = await AsyncStorage.getItem('has_seen_safety_prompt');
      if (!hasSeenSafety) {
        await AsyncStorage.setItem('has_seen_safety_prompt', 'true');
        Alert.alert(
          '⚠️ Safety Reminder',
          'Stay aware of your surroundings when meeting the ice cream truck. If you\'re in an unfamiliar neighborhood, meet at a well-lit public area. Never share personal information with drivers.',
          [{ text: 'Got it!' }]
        );
      }

      setRequestStatus('summoning');

      // Call backend API to create request
      await createRequestMutation.mutateAsync({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
      });

      // Notify nearby drivers of new request
      import('@/lib/notification-service').then(({ notifyDriverNewRequest }) => {
        notifyDriverNewRequest(
          userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
          'New order nearby'
        );
      }).catch(() => {});

      // Move to searching phase after 3 seconds
      setTimeout(() => {
        setRequestStatus('searching');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 3000);

      // Simulate driver acceptance after 8 seconds
      setTimeout(() => {
        setRequestStatus('accepted');
        setEstimatedTime(8);
        setDriverName('Ice Cream Mike');
        setDriverCheckpoint('🚚 On the way to your neighborhood!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Notify customer that driver accepted
        import('@/lib/notification-service').then(({ notifyCustomerAccepted }) => {
          notifyCustomerAccepted('Ice Cream Mike', 8);
        }).catch(() => {});
      }, 8000);

      // Simulate driver nearby after 15 seconds
      setTimeout(() => {
        setRequestStatus('nearby');
        setEstimatedTime(2);
        setDriverCheckpoint('📍 Almost there! About 2 minutes away');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 15000);

      // Simulate arrival after 20 seconds
      setTimeout(() => {
        setRequestStatus('arrived');
        setEstimatedTime(null);
        setDriverCheckpoint('🎉 Your Ice Cream Man has ARRIVED!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Play arrival jingle once
        if (arrivalPlayer && !arrivalPlayedRef.current) {
          arrivalPlayedRef.current = true;
          try {
            arrivalPlayer.volume = 0.6;
            arrivalPlayer.seekTo(0);
            arrivalPlayer.play();
          } catch (e) {
            console.log('Arrival jingle not available:', e);
          }
        }
      }, 20000);
    } catch (error) {
      console.error('Failed to send request:', error);
      setRequestStatus('idle');
      Alert.alert('Oops! 🍦', 'Failed to summon the ice cream man. Please try again!');
    }
  };

  const handleDeliveryComplete = () => {
    setRequestStatus('completed');
    setShowRating(true);
  };

  const handleCancelRequest = () => {
    setRequestStatus('idle');
    setEstimatedTime(null);
    arrivalPlayedRef.current = false; // Reset for next order
  };

  const handleRatingClose = () => {
    setShowRating(false);
    setRequestStatus('idle');
    arrivalPlayedRef.current = false; // Reset for next order
  };

  const getLocationDisplay = () => {
    if (isLoadingLocation) return 'Finding your location...';
    if (locationError) return 'Location unavailable - tap to retry';
    if (userLocation?.address) return userLocation.address;
    if (userLocation) return `${userLocation.latitude.toFixed(4)}°N, ${Math.abs(userLocation.longitude).toFixed(4)}°W`;
    return 'Enable location to order';
  };

  const isSummoning = requestStatus === 'summoning' || requestStatus === 'searching';

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-4 justify-between">
          {/* Header */}
          <View className="gap-2 items-center mb-2">
            <Text className="text-4xl font-bold text-foreground">🍦</Text>
            <Text className="text-2xl font-bold text-foreground">Ice Cream Man</Text>
            <Text className="text-xs text-muted font-medium">One tap. Ice cream delivered.</Text>
          </View>

          {/* Drivers Wanted Banner - shows when no drivers available */}
          {requestStatus === 'idle' && (
            <DriversWantedBanner registeredDrivers={0} activeCustomers={5} />
          )}

          {/* Location Status */}
          <View className="bg-surface rounded-lg p-3 flex-row items-center gap-3 border border-border">
            <Text className="text-lg">📍</Text>
            <View className="flex-1">
              <Text className="text-xs text-muted font-medium">Your Location</Text>
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {getLocationDisplay()}
              </Text>
            </View>
            {userLocation && !isLoadingLocation && <Text className="text-lg">✅</Text>}
            {isLoadingLocation && <Text className="text-lg">⏳</Text>}
          </View>

          {/* Summoning Animation - Shows during waiting */}
          {isSummoning && (
            <SummoningAnimation
              isActive={isSummoning}
              phase={requestStatus === 'summoning' ? 'summoning' : 'searching'}
            />
          )}

          {/* Driver Accepted / Arrived Status */}
          {requestStatus === 'accepted' && (
            <View className="bg-surface rounded-xl p-5 border border-border shadow-sm">
              <View className="items-center gap-3">
                <Text style={{ fontSize: 48 }}>🚚</Text>
                <Text className="text-lg font-bold text-foreground text-center">
                  {driverName} is on the way!
                </Text>
                {estimatedTime && (
                  <View className="bg-primary rounded-full px-6 py-2">
                    <Text className="text-white font-bold text-base">
                      {estimatedTime} min
                    </Text>
                  </View>
                )}
                {/* ETA Message from Driver */}
                <ETADisplay message={estimatedTime ? `${estimatedTime} minutes away` : null} driverName={driverName} />
                <Pressable
                  onPress={() => router.push('/(customer)/map')}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <View className="bg-primary rounded-lg px-4 py-2 mt-2">
                    <Text className="text-white font-semibold text-sm">🗺️ Track on Map</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={handleCancelRequest}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <Text className="text-error text-xs font-medium mt-2">Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Driver Nearby - Almost There */}
          {requestStatus === 'nearby' && (
            <View className="bg-surface rounded-xl p-5 border border-border shadow-sm">
              <View className="items-center gap-3">
                <Text style={{ fontSize: 48 }}>🚚</Text>
                <Text className="text-lg font-bold text-foreground text-center">
                  {driverName} is almost here!
                </Text>
                <View className="bg-warning rounded-full px-6 py-2">
                  <Text className="text-white font-bold text-base">
                    ~2 min
                  </Text>
                </View>
                <Text className="text-sm text-muted text-center">
                  Head outside and look for the truck!
                </Text>
                <Pressable
                  onPress={handleCancelRequest}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <Text className="text-error text-xs font-medium mt-2">Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Driver Checkpoint Banner */}
          {driverCheckpoint && (requestStatus === 'accepted' || requestStatus === 'nearby') && (
            <View className="bg-success bg-opacity-10 rounded-lg p-3 border border-success border-opacity-30">
              <Text className="text-xs text-success font-semibold">{driverCheckpoint}</Text>
            </View>
          )}

          {requestStatus === 'arrived' && (
            <View className="bg-surface rounded-xl p-5 border border-border shadow-sm">
              <View className="items-center gap-3">
                <Text style={{ fontSize: 56 }}>🎉🍦</Text>
                <Text className="text-xl font-bold text-foreground text-center">
                  Your Ice Cream Man is HERE!
                </Text>
                <Text className="text-sm text-muted text-center">
                  Go grab your ice cream!
                </Text>
                <Pressable
                  onPress={handleDeliveryComplete}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                >
                  <View className="bg-success rounded-lg px-8 py-3 mt-2">
                    <Text className="text-white font-bold text-base text-center">
                      Got My Ice Cream!
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}

          {/* BIG ICE CREAM ORDER BUTTON - Only show when idle */}
          {requestStatus === 'idle' && (
            <View className="flex-1 justify-center items-center py-2">
              {/* Outer glow ring */}
              <Animated.View
                style={{
                  opacity: glowAnim,
                  position: 'absolute',
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: '#FF69B4',
                }}
              />
              {/* Main button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  onPress={handleBigIceCreamPress}
                  disabled={createRequestMutation.isPending || !userLocation}
                  style={({ pressed }) => [
                    {
                      opacity: !userLocation ? 0.4 : pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.9 : 1 }],
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 260,
                      height: 260,
                      borderRadius: 130,
                      backgroundColor: '#FF1493',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 8,
                      borderColor: '#FF69B4',
                      shadowColor: '#FF1493',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.5,
                      shadowRadius: 20,
                      elevation: 15,
                    }}
                  >
                    <Text style={{ fontSize: 90 }}>🍦</Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '900',
                        color: 'white',
                        marginTop: 4,
                        textAlign: 'center',
                      }}
                    >
                      TAP TO ORDER!
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>

              {/* Call to action text */}
              <View className="mt-4 items-center">
                <Text className="text-lg font-bold text-foreground text-center">
                  Summon the Ice Cream Man
                </Text>
                {!userLocation && (
                  <Text className="text-xs text-error text-center mt-2 font-medium">
                    📍 Enable location to order
                  </Text>
                )}
                {userLocation && (
                  <Text className="text-xs text-muted text-center mt-2">
                    One tap brings the truck to your neighborhood
                  </Text>
                )}
              </View>

              {/* Fun Facts Ticker - rotates every 4 seconds */}
              <View style={{ marginTop: 16 }}>
                <FactTicker variant="card" />
              </View>
            </View>
          )}

          {/* Cancel button during summoning */}
          {isSummoning && (
            <Pressable
              onPress={handleCancelRequest}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-error rounded-xl p-4">
                <Text className="text-white font-bold text-center">Cancel Request</Text>
              </View>
            </Pressable>
          )}
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
