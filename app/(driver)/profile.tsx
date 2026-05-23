import { View, Text, Pressable, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';

export default function DriverProfileScreen() {
  const colors = useColors();
  const { logout } = useAuth();
  const router = useRouter();

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
            <Text className="text-sm text-muted">Your vendor account</Text>
          </View>

          {/* Profile Card */}
          <View className="bg-surface rounded-2xl p-6 border-2 border-primary">
            <View className="items-center gap-4">
              <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
                <Text className="text-4xl">🚚</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-foreground">Ice Cream Vendor</Text>
                <Text className="text-sm text-muted">vendor@example.com</Text>
              </View>
            </View>
          </View>

          {/* Vehicle Info */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground mb-2">Vehicle Information</Text>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Vehicle Type</Text>
              <Text className="text-sm font-semibold text-foreground">Ice Cream Truck</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">License Plate</Text>
              <Text className="text-sm font-semibold text-foreground">ICE-123</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Status</Text>
              <View className="bg-success rounded-full px-3 py-1">
                <Text className="text-xs font-semibold text-white">Online</Text>
              </View>
            </View>
          </View>

          {/* Settings */}
          <View className="gap-3">
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
                  <Text className="text-xl">💳</Text>
                  <Text className="font-semibold text-foreground">Payment Method</Text>
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
                  <Text className="font-semibold text-foreground">Settings</Text>
                </View>
                <Text className="text-muted">→</Text>
              </View>
            </Pressable>
          </View>

          {/* Logout Button */}
          <View className="flex-1 justify-end">
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-error rounded-lg p-4">
                <Text className="text-white font-semibold text-center">Logout</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
