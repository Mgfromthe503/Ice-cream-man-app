import { View, Text, Pressable, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { ShareButton } from '@/components/share-button';

export default function CustomerProfileScreen() {
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
            <Text className="text-sm text-muted">Your account settings</Text>
          </View>

          {/* Profile Card */}
          <View className="bg-surface rounded-2xl p-6 border-2 border-primary">
            <View className="items-center gap-4">
              <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
                <Text className="text-4xl">👤</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-foreground">John Doe</Text>
                <Text className="text-sm text-muted">john@example.com</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 items-center">
              <Text className="text-2xl font-bold text-primary">12</Text>
              <Text className="text-xs text-muted text-center">Orders</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 items-center">
              <Text className="text-2xl font-bold text-success">4.8</Text>
              <Text className="text-xs text-muted text-center">Rating</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 items-center">
              <Text className="text-2xl font-bold text-warning">$45</Text>
              <Text className="text-xs text-muted text-center">Spent</Text>
            </View>
          </View>

          {/* Share & Settings */}
          <View className="gap-3">
            <ShareButton variant="primary" size="medium" showLabel={true} />

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
