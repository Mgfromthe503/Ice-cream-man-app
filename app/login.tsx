/**
 * Login Screen
 * 
 * Supports both OAuth (normal users) and email/password (Google Play reviewers).
 * Test accounts bypass all verification and payment gates.
 */
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { setSessionToken, setUserInfo } from '@/lib/_core/auth';

const API_BASE = Platform.OS === 'web'
  ? (typeof window !== 'undefined' ? window.location.origin.replace(/:\d+$/, ':3000').replace(/8081[^/]*/, '3000') : 'http://localhost:3000')
  : 'http://localhost:3000';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const colors = useColors();
  // Pre-fill with customer test credentials to save reviewer time
  const [email, setEmail] = useState('Icecream@customertest.com');
  const [password, setPassword] = useState('GoogleTest2026!');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // Call test-login endpoint
      const response = await fetch(`${API_BASE}/api/auth/test-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert('Login Failed', data.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // Set role and user state
      const role = data.user.role as 'customer' | 'driver';
      
      // Store the real signed session token for tRPC Bearer auth
      if (data.sessionToken) {
        await setSessionToken(data.sessionToken);
        await setUserInfo({
          id: 0,
          openId: data.user.openId,
          name: data.user.name,
          email: data.user.email,
          loginMethod: 'test_account',
          lastSignedIn: new Date(),
        });
      }
      
      await login(email, password, role);

      // If driver test account — pre-seed all registration/payment state
      if (role === 'driver' && data.driverProfile) {
        const dp = data.driverProfile;
        await AsyncStorage.setItem('vendorRegistrationPaid', 'true');
        await AsyncStorage.setItem('driverIsRegistered', 'true');
        await AsyncStorage.setItem('driverAreaCode', dp.areaCode);
        await AsyncStorage.setItem('driverTruckNumber', dp.truckNumber);
        await AsyncStorage.setItem('driverRegistration', JSON.stringify({
          fullName: dp.fullName,
          truckName: dp.truckName,
          truckDescription: 'Google Play Review Truck',
          phoneNumber: '555-0100',
          areaCode: dp.areaCode,
          truckNumber: dp.truckNumber,
        }));
      }

      // Navigate to the appropriate dashboard
      if (role === 'customer') {
        router.replace('/(customer)');
      } else {
        router.replace('/(driver)');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToRoleSelect = () => {
    router.replace('/role-select');
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FFF8DC', '#FFE4E1', '#FFB6D9', '#FF69B4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScreenContainer className="p-6" containerClassName="bg-transparent">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <View style={{ gap: 24 }}>
              {/* Header */}
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 48 }}>🍦</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#8B4513' }}>
                  The Ice Cream Man
                </Text>
                <Text style={{ fontSize: 14, color: '#A0522D', textAlign: 'center' }}>
                  Sign in to your account
                </Text>
              </View>

              {/* Form */}
              <View style={{ gap: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 24 }}>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#555' }}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    style={{
                      backgroundColor: '#f8f8f8',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                    }}
                  />
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#555' }}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    style={{
                      backgroundColor: '#f8f8f8',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                    }}
                  />
                </View>

                <Pressable
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={({ pressed }) => [{
                    backgroundColor: '#FF69B4',
                    paddingVertical: 16,
                    borderRadius: 14,
                    alignItems: 'center',
                    opacity: pressed ? 0.9 : isLoading ? 0.6 : 1,
                    marginTop: 8,
                  }]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>
                      Sign In
                    </Text>
                  )}
                </Pressable>
              </View>

              {/* Quick-fill buttons for reviewer convenience */}
              <View style={{ gap: 10 }}>
                <Text style={{ textAlign: 'center', color: '#8B4513', fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
                  Quick Fill Test Account:
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                  <Pressable
                    onPress={() => { setEmail('Icecream@customertest.com'); setPassword('GoogleTest2026!'); }}
                    style={({ pressed }) => [{
                      backgroundColor: pressed ? '#FF85C8' : '#FFB6D9',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                    }]}
                  >
                    <Text style={{ color: '#8B4513', fontSize: 13, fontWeight: '600' }}>🍦 Customer</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setEmail('Icecream@driverlogintest.com'); setPassword('GoogleTest2026!'); }}
                    style={({ pressed }) => [{
                      backgroundColor: pressed ? '#FFD080' : '#FFE4A0',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                    }]}
                  >
                    <Text style={{ color: '#8B4513', fontSize: 13, fontWeight: '600' }}>🚗 Driver</Text>
                  </Pressable>
                </View>
              </View>

              {/* Skip to role select (for normal users using OAuth) */}
              <Pressable
                onPress={handleSkipToRoleSelect}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={{ textAlign: 'center', color: '#8B4513', fontSize: 14, fontWeight: '500' }}>
                  Continue without login →
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </ScreenContainer>
      </LinearGradient>
    </View>
  );
}
