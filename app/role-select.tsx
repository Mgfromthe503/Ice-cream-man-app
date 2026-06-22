import { View, Text, Pressable, ScrollView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { FactTicker } from '@/components/fact-ticker';

export default function RoleSelectScreen() {
  const router = useRouter();
  const { setUserRole } = useAuth();

  const handleRoleSelect = async (role: 'customer' | 'driver') => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
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
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FFF8DC', '#FFE4E1', '#FFB6D9', '#FF69B4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScreenContainer containerClassName="bg-transparent" className="p-6">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
            <View style={{ flex: 1, gap: 28, justifyContent: 'center' }}>
              {/* Premium Header with Logo */}
              <View style={{ alignItems: 'center', gap: 12 }}>
                <Image
                  source={require('@/assets/images/ice-cream-man-logo.png')}
                  style={{ width: 100, height: 100, resizeMode: 'contain' }}
                />
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 36, fontWeight: '900', color: '#8B4513', letterSpacing: 1 }}>
                    ICE CREAM MAN
                  </Text>
                  <Text style={{ fontSize: 14, color: '#A0826D', textAlign: 'center', fontWeight: '600' }}>
                    Choose your role to get started
                  </Text>
                </View>
              </View>

              {/* Customer Card with Premium Graphics */}
              <Pressable
                onPress={() => handleRoleSelect('customer')}
                style={({ pressed }) => [{
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                }]}
              >
                <LinearGradient
                  colors={['#FF69B4', '#FF1493', '#C71585']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 24,
                    padding: 24,
                    shadowColor: '#FF1493',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 10,
                  }}
                >
                  <View style={{ alignItems: 'center', gap: 12 }}>
                    <Image
                      source={require('@/assets/images/customer-character.png')}
                      style={{ width: 120, height: 120, resizeMode: 'contain' }}
                    />
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFFFFF' }}>
                      Customer
                    </Text>
                    <Text style={{ fontSize: 14, color: '#FFE4E1', textAlign: 'center', lineHeight: 20 }}>
                      Order ice cream to your neighborhood with one tap.{'\n'}Track the ice cream truck in real-time.
                    </Text>
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      borderRadius: 20,
                      paddingHorizontal: 20,
                      paddingVertical: 8,
                      marginTop: 4,
                    }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                        Tap to Order Ice Cream →
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Driver Card with Premium Graphics */}
              <Pressable
                onPress={() => handleRoleSelect('driver')}
                style={({ pressed }) => [{
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                }]}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500', '#FF8C00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 24,
                    padding: 24,
                    shadowColor: '#FF8C00',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 10,
                  }}
                >
                  <View style={{ alignItems: 'center', gap: 12 }}>
                    <Image
                      source={require('@/assets/images/driver-character.png')}
                      style={{ width: 120, height: 120, resizeMode: 'contain' }}
                    />
                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFFFFF' }}>
                      Ice Cream Vendor
                    </Text>
                    <Text style={{ fontSize: 14, color: '#FFF8E7', textAlign: 'center', lineHeight: 20 }}>
                      Receive customer requests and earn money.{'\n'}Get alerts for neighborhoods requesting service.
                    </Text>
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      borderRadius: 20,
                      paddingHorizontal: 20,
                      paddingVertical: 8,
                      marginTop: 4,
                    }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                        Start Earning Money →
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Fun Facts Ticker */}
              <FactTicker variant="banner" />

              {/* Footer tagline */}
              <View style={{ alignItems: 'center', gap: 4, marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: '#A0826D', textAlign: 'center' }}>
                  Connecting neighborhoods with ice cream trucks
                </Text>
                <Text style={{ fontSize: 11, color: '#C4A882' }}>
                  v1.0.0
                </Text>
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </LinearGradient>
    </View>
  );
}
