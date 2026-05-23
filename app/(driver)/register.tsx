import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface DriverRegistration {
  fullName: string;
  truckName: string;
  truckDescription: string;
  phoneNumber: string;
  areaCode: string;
  truckNumber: string;
}

// Generate a unique truck number (ICM-XXXX format)
function generateTruckNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ICM-${num}`;
}

export default function DriverRegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<DriverRegistration>({
    fullName: '',
    truckName: '',
    truckDescription: '',
    phoneNumber: '',
    areaCode: '',
    truckNumber: '',
  });

  // Check if driver is already registered
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const saved = await AsyncStorage.getItem('driverRegistration');
        if (saved) {
          const data = JSON.parse(saved);
          setForm(data);
          setIsRegistered(true);
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkRegistration();
  }, []);

  const handleRegister = async () => {
    // Validate required fields
    if (!form.fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    if (!form.truckName.trim()) {
      Alert.alert('Required', 'Please enter your truck name or business name.');
      return;
    }
    if (!form.phoneNumber.trim()) {
      Alert.alert('Required', 'Please enter your phone number.');
      return;
    }
    if (!form.areaCode.trim() || form.areaCode.length < 3) {
      Alert.alert('Required', 'Please enter a valid area/zip code (3-5 digits).');
      return;
    }

    setIsSaving(true);
    try {
      // Auto-assign a truck number
      const truckNumber = generateTruckNumber();
      const registrationData = { ...form, truckNumber };

      // Save registration locally
      await AsyncStorage.setItem('driverRegistration', JSON.stringify(registrationData));
      await AsyncStorage.setItem('driverAreaCode', form.areaCode);
      await AsyncStorage.setItem('driverIsRegistered', 'true');
      await AsyncStorage.setItem('driverTruckNumber', truckNumber);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setForm(registrationData);
      setIsRegistered(true);

      Alert.alert(
        '🎉 Registration Complete!',
        `Welcome aboard, ${form.fullName}!\n\nYour assigned truck number is:\n\n🚚 ${truckNumber}\n\nYour truck "${form.truckName}" is now active in the ${form.areaCode} area. You'll start receiving ice cream requests!`,
        [{ text: 'Start Driving!', onPress: () => router.replace('/(driver)') }]
      );
    } catch (error) {
      console.error('Error saving registration:', error);
      Alert.alert('Error', 'Failed to save registration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRegistration = () => {
    setIsRegistered(false);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  // Already registered - show profile card with truck number
  if (isRegistered) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 gap-6">
            <View className="items-center gap-3">
              <Text style={{ fontSize: 60 }}>🚚✅</Text>
              <Text className="text-2xl font-bold text-foreground text-center">
                You're Registered!
              </Text>
              <Text className="text-sm text-muted text-center">
                Your truck is active and ready to receive requests
              </Text>
            </View>

            {/* Truck Number Badge - Big and Prominent */}
            <View
              style={{
                backgroundColor: '#FF1493',
                borderRadius: 20,
                padding: 20,
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#FFD700',
                shadowColor: '#FF1493',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text style={{ fontSize: 14, color: '#FFF8E7', fontWeight: '600' }}>YOUR TRUCK NUMBER</Text>
              <Text style={{ fontSize: 36, fontWeight: '900', color: '#FFFFFF', marginTop: 4 }}>
                {form.truckNumber}
              </Text>
              <Text style={{ fontSize: 12, color: '#FFF8E7', marginTop: 4 }}>
                Customers will see this number when you accept their request
              </Text>
            </View>

            {/* Registration Card */}
            <View className="bg-surface rounded-2xl p-5 border-2 border-success gap-4">
              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 30 }}>👤</Text>
                <View>
                  <Text className="text-xs text-muted">Driver Name</Text>
                  <Text className="text-lg font-bold text-foreground">{form.fullName}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 30 }}>🚚</Text>
                <View>
                  <Text className="text-xs text-muted">Truck Name</Text>
                  <Text className="text-lg font-bold text-foreground">{form.truckName}</Text>
                </View>
              </View>

              {form.truckDescription ? (
                <View className="flex-row items-center gap-3">
                  <Text style={{ fontSize: 30 }}>📝</Text>
                  <View className="flex-1">
                    <Text className="text-xs text-muted">Description</Text>
                    <Text className="text-sm text-foreground">{form.truckDescription}</Text>
                  </View>
                </View>
              ) : null}

              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 30 }}>📍</Text>
                <View>
                  <Text className="text-xs text-muted">Coverage Zone</Text>
                  <Text className="text-lg font-bold text-foreground">{form.areaCode}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 30 }}>📞</Text>
                <View>
                  <Text className="text-xs text-muted">Phone</Text>
                  <Text className="text-sm text-foreground">{form.phoneNumber}</Text>
                </View>
              </View>
            </View>

            {/* Status Badge */}
            <View className="bg-success rounded-xl p-4 items-center">
              <Text className="text-white font-bold text-lg">🟢 Active & Receiving Requests</Text>
            </View>

            {/* Edit Button */}
            <Pressable
              onPress={handleEditRegistration}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-surface border border-border rounded-xl p-4">
                <Text className="text-foreground font-semibold text-center">✏️ Edit Registration</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Registration Form - Simple: Name, Truck Name, Phone, Area Code
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-5">
          {/* Header */}
          <View className="items-center gap-3">
            <Text style={{ fontSize: 50 }}>🚚</Text>
            <Text className="text-2xl font-bold text-foreground text-center">
              Register Your Ice Cream Truck
            </Text>
            <Text className="text-sm text-muted text-center px-4">
              Sign up to start receiving customer requests. You'll be assigned a unique truck number!
            </Text>
          </View>

          {/* Form Fields */}
          <View className="gap-4">
            {/* Full Name */}
            <View className="gap-1">
              <Text className="text-sm font-semibold text-foreground">Your Full Name *</Text>
              <TextInput
                value={form.fullName}
                onChangeText={(text) => setForm({ ...form, fullName: text })}
                placeholder="Enter your full name"
                className="bg-surface rounded-lg p-4 text-foreground border border-border"
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Truck Name */}
            <View className="gap-1">
              <Text className="text-sm font-semibold text-foreground">Truck/Business Name *</Text>
              <TextInput
                value={form.truckName}
                onChangeText={(text) => setForm({ ...form, truckName: text })}
                placeholder="e.g. Frosty's Ice Cream, Cool Treats Mobile"
                className="bg-surface rounded-lg p-4 text-foreground border border-border"
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Truck Description */}
            <View className="gap-1">
              <Text className="text-sm font-semibold text-foreground">What Do You Sell?</Text>
              <TextInput
                value={form.truckDescription}
                onChangeText={(text) => setForm({ ...form, truckDescription: text })}
                placeholder="e.g. Ice cream cones, popsicles, sundaes, milkshakes..."
                multiline
                numberOfLines={3}
                className="bg-surface rounded-lg p-4 text-foreground border border-border"
                placeholderTextColor={colors.muted}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            {/* Phone Number */}
            <View className="gap-1">
              <Text className="text-sm font-semibold text-foreground">Phone Number *</Text>
              <TextInput
                value={form.phoneNumber}
                onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
                className="bg-surface rounded-lg p-4 text-foreground border border-border"
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Area/Zip Code */}
            <View className="gap-1">
              <Text className="text-sm font-semibold text-foreground">Your Coverage Area (Zip Code) *</Text>
              <TextInput
                value={form.areaCode}
                onChangeText={(text) => setForm({ ...form, areaCode: text })}
                placeholder="e.g. 97201"
                keyboardType="number-pad"
                maxLength={5}
                className="bg-surface rounded-lg p-4 text-foreground border border-border"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-xs text-muted">You'll receive requests from customers in this area</Text>
            </View>
          </View>

          {/* What You Get Info */}
          <View className="bg-surface rounded-xl p-4 gap-2 border border-primary">
            <Text className="text-sm font-semibold text-foreground">🎁 What You Get:</Text>
            <Text className="text-xs text-muted leading-5">
              ✅ A unique truck number assigned to you{"\n"}
              ✅ Customer requests sent directly to your phone{"\n"}
              ✅ Daily reports showing gas & time saved{"\n"}
              ✅ No more driving around aimlessly!
            </Text>
          </View>

          {/* Register Button */}
          <Pressable
            onPress={handleRegister}
            disabled={isSaving}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          >
            <View className="bg-primary rounded-xl p-5 items-center">
              <Text className="text-white font-bold text-lg">
                {isSaving ? '⏳ Registering...' : '🚚 Register & Get My Truck Number'}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
