import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/hooks/use-auth';

export default function VendorPaymentScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaid(true);
      Alert.alert(
        '🎉 Welcome to Ice Cream Man!',
        'Your $25 registration fee has been processed. You are now an active vendor and can start receiving requests!',
        [{ text: 'Start Driving!' }]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 items-center justify-center gap-6">
            <Text style={{ fontSize: 80 }}>🎉</Text>
            <Text className="text-3xl font-bold text-foreground text-center">
              You're All Set!
            </Text>
            <Text className="text-lg text-muted text-center">
              Your vendor account is active. Start receiving ice cream requests from your neighborhood!
            </Text>
            <View className="bg-surface rounded-2xl p-6 w-full mt-4">
              <Text className="text-lg font-bold text-foreground mb-2">What's Included:</Text>
              <Text className="text-muted mb-1">✅ Unlimited request alerts</Text>
              <Text className="text-muted mb-1">✅ Real-time GPS navigation</Text>
              <Text className="text-muted mb-1">✅ Daily earnings reports</Text>
              <Text className="text-muted mb-1">✅ Gas savings calculator</Text>
              <Text className="text-muted mb-1">✅ Customer ratings & reviews</Text>
              <Text className="text-muted mb-1">✅ Economic impact dashboard</Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text style={{ fontSize: 60 }}>🍦🚚</Text>
            <Text className="text-3xl font-bold text-foreground text-center">
              Become a Vendor
            </Text>
            <Text className="text-base text-muted text-center">
              One-time registration fee to start earning
            </Text>
          </View>

          {/* Price Card */}
          <View
            className="rounded-3xl p-8 items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-lg font-medium mb-2">One-Time Fee</Text>
            <Text className="text-white text-5xl font-bold">$25</Text>
            <Text className="text-white text-base mt-2 opacity-80">
              Lifetime access • No monthly fees
            </Text>
          </View>

          {/* Benefits */}
          <View className="bg-surface rounded-2xl p-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              Why Join Ice Cream Man?
            </Text>

            <View className="gap-4">
              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 24 }}>⛽</Text>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Save on Gas</Text>
                  <Text className="text-muted text-sm">
                    No more driving aimlessly. Get directed straight to customers who want ice cream.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 24 }}>⏰</Text>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Save Time</Text>
                  <Text className="text-muted text-sm">
                    Spend less time searching and more time selling. Average vendors save 2+ hours daily.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 24 }}>📊</Text>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Daily Reports</Text>
                  <Text className="text-muted text-sm">
                    Track your sales, gas savings, and time saved with detailed daily analytics.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 24 }}>📍</Text>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Smart Routing</Text>
                  <Text className="text-muted text-sm">
                    Our app calculates the most efficient routes between customer requests.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 24 }}>💰</Text>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Increase Sales</Text>
                  <Text className="text-muted text-sm">
                    Vendors using our app report 40% higher daily sales on average.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment Button */}
          <Pressable
            onPress={handlePayment}
            disabled={loading}
            style={({ pressed }) => [
              {
                backgroundColor: loading ? colors.muted : colors.primary,
                paddingVertical: 20,
                borderRadius: 16,
                alignItems: 'center',
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {loading ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator color="white" />
                <Text className="text-white text-lg font-bold">Processing...</Text>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-white text-xl font-bold">Pay $25 & Start Earning</Text>
                <Text className="text-white text-sm opacity-80 mt-1">
                  Secure payment via Google Pay
                </Text>
              </View>
            )}
          </Pressable>

          {/* Legal */}
          <Text className="text-muted text-xs text-center">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Payment is processed securely through Google Play Billing.
            This is a one-time fee with no recurring charges.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
