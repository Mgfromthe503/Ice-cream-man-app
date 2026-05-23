import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/lib/auth-context';
import { useLocation } from '@/lib/location-context';
import { useRouter } from 'expo-router';
import { ShareButton } from '@/components/share-button';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomerProfileScreen() {
  const colors = useColors();
  const { logout } = useAuth();
  const { userLocation } = useLocation();
  const router = useRouter();
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const deliveries = await AsyncStorage.getItem('totalDeliveries');
        setTotalOrders(parseInt(deliveries || '0', 10));
      } catch (error) {
        // Silently fail
      }
    };
    loadStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Profile</Text>
            <Text className="text-sm text-muted">Your account settings</Text>
          </View>

          {/* Profile Card */}
          <View className="bg-surface rounded-2xl p-6 border-2 border-primary">
            <View className="items-center gap-4">
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#FF69B4',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-4xl">🍦</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-foreground">Ice Cream Lover</Text>
                <Text className="text-sm text-muted">Customer</Text>
              </View>
            </View>
          </View>

          {/* Stats - Only show real data */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 items-center">
              <Text className="text-2xl font-bold text-primary">{totalOrders}</Text>
              <Text className="text-xs text-muted text-center">Orders Made</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 items-center">
              <Text className="text-2xl">📍</Text>
              <Text className="text-xs text-muted text-center">
                {userLocation ? 'Location Active' : 'Location Off'}
              </Text>
            </View>
          </View>

          {/* Share with Friends */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Share with Friends</Text>
            <ShareButton variant="primary" size="medium" showLabel={true} />
          </View>

          {/* Settings */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Settings</Text>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between border border-border">
                <View className="flex-row items-center gap-3">
                  <Text className="text-xl">🔔</Text>
                  <Text className="font-semibold text-foreground">Notifications</Text>
                </View>
                <Text className="text-muted">→</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between border border-border">
                <View className="flex-row items-center gap-3">
                  <Text className="text-xl">📍</Text>
                  <Text className="font-semibold text-foreground">Location Settings</Text>
                </View>
                <Text className="text-muted">→</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between border border-border">
                <View className="flex-row items-center gap-3">
                  <Text className="text-xl">⚙️</Text>
                  <Text className="font-semibold text-foreground">App Settings</Text>
                </View>
                <Text className="text-muted">→</Text>
              </View>
            </Pressable>
          </View>

          {/* Logout Button */}
          <View className="flex-1 justify-end gap-3">
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-error rounded-lg p-4">
                <Text className="text-white font-semibold text-center">Logout</Text>
              </View>
            </Pressable>
            <Text className="text-xs text-muted text-center">v1.0.0 | Made with ❤️ by Mindy Gaines</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
