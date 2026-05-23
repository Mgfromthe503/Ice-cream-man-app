import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, Alert } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import optional modules
let StoreReview: any = null;
let Sharing: any = null;

try {
  StoreReview = require('expo-store-review');
} catch (e) {
  // Module not available
}

try {
  Sharing = require('expo-sharing');
} catch (e) {
  // Module not available
}

interface RatingsPromptProps {
  triggerAfterDeliveries?: number; // Show after N deliveries
  onRatingSubmitted?: (rating: number) => void;
}

export function RatingsPrompt({ triggerAfterDeliveries = 3, onRatingSubmitted }: RatingsPromptProps) {
  const colors = useColors();
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [hasRatedThisSession, setHasRatedThisSession] = useState(false);

  // Check if we should show the rating prompt
  useEffect(() => {
    const checkAndShowRatingPrompt = async () => {
      try {
        const lastRatingTime = await AsyncStorage.getItem('lastRatingPromptTime');
        const deliveries = await AsyncStorage.getItem('totalDeliveries');
        const currentDeliveries = parseInt(deliveries || '0', 10);

        setDeliveryCount(currentDeliveries);

        // Show prompt if:
        // 1. User has had enough deliveries
        // 2. Haven't shown prompt in last 7 days
        // 3. Haven't rated this session
        if (currentDeliveries >= triggerAfterDeliveries && !hasRatedThisSession) {
          const lastTime = lastRatingTime ? parseInt(lastRatingTime, 10) : 0;
          const daysSinceLastPrompt = (Date.now() - lastTime) / (1000 * 60 * 60 * 24);

          if (daysSinceLastPrompt >= 7 || lastTime === 0) {
            setShowRatingPrompt(true);
          }
        }
      } catch (error) {
        console.error('Error checking rating prompt:', error);
      }
    };

    checkAndShowRatingPrompt();
  }, [triggerAfterDeliveries, hasRatedThisSession]);

  const handleRating = async (rating: number) => {
    try {
      // Save rating timestamp
      await AsyncStorage.setItem('lastRatingPromptTime', Date.now().toString());
      await AsyncStorage.setItem(`rating_${Date.now()}`, rating.toString());

      // Send rating to backend
      try {
        // TODO: Send to backend API
        // await trpc.ratings.submit.mutate({ rating, timestamp: Date.now() });
      } catch (error) {
        console.error('Error submitting rating:', error);
      }

      setHasRatedThisSession(true);
      setShowRatingPrompt(false);

      if (onRatingSubmitted) {
        onRatingSubmitted(rating);
      }

      // Show thank you message
      Alert.alert('Thank You! 🎉', 'Thanks for loving The Ice Cream Man!', [
        {
          text: 'Share with Friends',
          onPress: handleShare,
        },
        {
          text: 'Done',
          onPress: () => {},
        },
      ]);

      // Request app store review if rating is high
      if (rating >= 4 && StoreReview) {
        try {
          if (await StoreReview.isAvailableAsync()) {
            await StoreReview.requestReview();
          }
        } catch (error) {
          console.error('Error requesting store review:', error);
        }
      }
    } catch (error) {
      console.error('Error handling rating:', error);
    }
  };

  const handleShare = async () => {
    try {
      const message = '🍦 Download The Ice Cream Man! Order ice cream to your neighborhood with one tap. Get it on Google Play: https://play.google.com/store/apps/details?id=space.manus.the.ice.cream.man';

      if (Sharing && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(message, {
          dialogTitle: 'Share The Ice Cream Man',
        });
      } else {
        Alert.alert('Sharing not available on this platform');
      }
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleDismiss = async () => {
    setShowRatingPrompt(false);
    // Save dismissal so we don't show again for a while
    await AsyncStorage.setItem('lastRatingPromptTime', Date.now().toString());
  };

  return (
    <Modal visible={showRatingPrompt} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-background rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          {/* Header */}
          <View className="items-center mb-6">
            <Text className="text-5xl mb-4">🍦</Text>
            <Text className="text-2xl font-bold text-foreground text-center">Love The Ice Cream Man?</Text>
          </View>

          {/* Message */}
          <Text className="text-center text-muted mb-8 text-base leading-relaxed">
            We'd love to know what you think! Your feedback helps us improve.
          </Text>

          {/* Star Rating */}
          <View className="flex-row justify-center gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleRating(star)}
                style={({ pressed }) => [
                  {
                    transform: [{ scale: pressed ? 1.2 : 1 }],
                  },
                ]}
              >
                <Text className="text-5xl">{star <= 4 ? '⭐' : '✨'}</Text>
              </Pressable>
            ))}
          </View>

          {/* Rating Labels */}
          <View className="flex-row justify-between mb-8 px-2">
            <Text className="text-xs text-muted">Not great</Text>
            <Text className="text-xs text-muted font-semibold">Amazing!</Text>
          </View>

          {/* Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={() => handleRating(5)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-primary rounded-xl p-4">
                <Text className="text-center font-bold text-white">Love It! ❤️</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-surface rounded-xl p-4 border border-border">
                <Text className="text-center font-semibold text-foreground">Maybe Later</Text>
              </View>
            </Pressable>
          </View>

          {/* Share Hint */}
          <Text className="text-center text-xs text-muted mt-6">
            💡 Tip: Share with friends to earn referral rewards!
          </Text>
        </View>
      </View>
    </Modal>
  );
}
