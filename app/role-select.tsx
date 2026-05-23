import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';

export default function RoleSelectScreen() {
  const router = useRouter();
  const { setUserRole } = useAuth();
  const colors = useColors();

  const handleRoleSelect = async (role: 'customer' | 'driver') => {
    try {
      await setUserRole(role);
      if (role === 'customer') {
        router.replace('/(customer)');
      } else {
        router.replace('/(driver)');
      }
    } catch (error) {
      console.error('Failed to set role:', error);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-8 justify-center">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">🍦 Ice Cream Man</Text>
            <Text className="text-base text-muted text-center">Choose your role to get started</Text>
          </View>

          {/* Customer Card */}
          <Pressable
            onPress={() => handleRoleSelect('customer')}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View className="bg-surface rounded-2xl p-8 border-2 border-primary shadow-md">
              <Text className="text-5xl text-center mb-4">👨‍👧‍👦</Text>
              <Text className="text-2xl font-bold text-foreground text-center mb-2">Customer</Text>
              <Text className="text-sm text-muted text-center leading-relaxed">
                Order ice cream to your neighborhood with one tap. Track the ice cream truck in real-time.
              </Text>
            </View>
          </Pressable>

          {/* Driver Card */}
          <Pressable
            onPress={() => handleRoleSelect('driver')}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View className="bg-surface rounded-2xl p-8 border-2 border-warning shadow-md">
              <Text className="text-5xl text-center mb-4">🚚</Text>
              <Text className="text-2xl font-bold text-foreground text-center mb-2">Ice Cream Vendor</Text>
              <Text className="text-sm text-muted text-center leading-relaxed">
                Receive customer requests and earn money. Get alerts for neighborhoods requesting service.
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
