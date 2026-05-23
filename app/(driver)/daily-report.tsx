import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

// Constants for calculations
const AVERAGE_GAS_PRICE = 3.50; // $ per gallon
const VEHICLE_MPG = 15; // Average ice cream truck MPG
const AVERAGE_SPEED_MPH = 25; // Average speed in neighborhoods

interface DailyReport {
  date: string;
  totalOrders: number;
  totalSales: number;
  milesDriven: number;
  gasSavings: {
    milesWithoutApp: number;
    milesWithApp: number;
    milesSaved: number;
    gallonsSaved: number;
    moneySaved: number;
  };
  timeSavings: {
    hoursWithoutApp: number;
    hoursWithApp: number;
    hoursSaved: number;
  };
}

export default function DailyReportScreen() {
  const colors = useColors();
  const [salesInput, setSalesInput] = useState('');
  const [ordersInput, setOrdersInput] = useState('');
  const [milesInput, setMilesInput] = useState('');
  const [report, setReport] = useState<DailyReport | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const calculateReport = () => {
    const totalSales = parseFloat(salesInput) || 0;
    const totalOrders = parseInt(ordersInput) || 0;
    const milesDriven = parseFloat(milesInput) || 0;

    if (totalSales === 0 && totalOrders === 0) {
      Alert.alert('Enter Your Data', 'Please enter your sales and orders for today.');
      return;
    }

    // Without app: estimate driver would drive 3x more to find customers
    const milesWithoutApp = milesDriven * 3;
    const milesSaved = milesWithoutApp - milesDriven;
    const gallonsSaved = milesSaved / VEHICLE_MPG;
    const moneySaved = gallonsSaved * AVERAGE_GAS_PRICE;

    // Time savings
    const hoursWithoutApp = milesWithoutApp / AVERAGE_SPEED_MPH;
    const hoursWithApp = milesDriven / AVERAGE_SPEED_MPH;
    const hoursSaved = hoursWithoutApp - hoursWithApp;

    const newReport: DailyReport = {
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      totalOrders,
      totalSales,
      milesDriven,
      gasSavings: {
        milesWithoutApp: Math.round(milesWithoutApp * 10) / 10,
        milesWithApp: milesDriven,
        milesSaved: Math.round(milesSaved * 10) / 10,
        gallonsSaved: Math.round(gallonsSaved * 10) / 10,
        moneySaved: Math.round(moneySaved * 100) / 100,
      },
      timeSavings: {
        hoursWithoutApp: Math.round(hoursWithoutApp * 10) / 10,
        hoursWithApp: Math.round(hoursWithApp * 10) / 10,
        hoursSaved: Math.round(hoursSaved * 10) / 10,
      },
    };

    setReport(newReport);
    setSubmitted(true);
  };

  if (submitted && report) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 gap-4">
            {/* Header */}
            <View className="items-center gap-2 mb-2">
              <Text style={{ fontSize: 40 }}>📊</Text>
              <Text className="text-2xl font-bold text-foreground text-center">
                Daily Report
              </Text>
              <Text className="text-sm text-muted">{report.date}</Text>
            </View>

            {/* Sales Summary */}
            <View className="bg-surface rounded-2xl p-5">
              <Text className="text-lg font-bold text-foreground mb-3">💰 Sales Summary</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted">Total Sales</Text>
                <Text className="text-foreground font-bold text-lg">
                  ${report.totalSales.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted">Orders Completed</Text>
                <Text className="text-foreground font-bold">{report.totalOrders}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Avg Per Order</Text>
                <Text className="text-foreground font-bold">
                  ${report.totalOrders > 0 ? (report.totalSales / report.totalOrders).toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>

            {/* Gas Savings */}
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: '#E8F5E9' }}
            >
              <Text className="text-lg font-bold mb-3" style={{ color: '#2E7D32' }}>
                ⛽ Gas Savings
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: '#4CAF50' }}>Miles driven today</Text>
                <Text className="font-bold" style={{ color: '#2E7D32' }}>
                  {report.milesDriven} mi
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: '#4CAF50' }}>Miles without app (est.)</Text>
                <Text className="font-bold" style={{ color: '#2E7D32' }}>
                  {report.gasSavings.milesWithoutApp} mi
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: '#4CAF50' }}>Miles saved</Text>
                <Text className="font-bold" style={{ color: '#2E7D32' }}>
                  {report.gasSavings.milesSaved} mi
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: '#4CAF50' }}>Gallons saved</Text>
                <Text className="font-bold" style={{ color: '#2E7D32' }}>
                  {report.gasSavings.gallonsSaved} gal
                </Text>
              </View>
              <View
                className="rounded-xl p-4 mt-2 items-center"
                style={{ backgroundColor: '#C8E6C9' }}
              >
                <Text style={{ color: '#1B5E20', fontSize: 14 }}>You Saved</Text>
                <Text style={{ color: '#1B5E20', fontSize: 32, fontWeight: 'bold' }}>
                  ${report.gasSavings.moneySaved.toFixed(2)}
                </Text>
                <Text style={{ color: '#2E7D32', fontSize: 12 }}>in gas today!</Text>
              </View>
            </View>

            {/* Time Savings */}
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: '#E3F2FD' }}
            >
              <Text className="text-lg font-bold mb-3" style={{ color: '#1565C0' }}>
                ⏰ Time Savings
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: '#42A5F5' }}>Time driving today</Text>
                <Text className="font-bold" style={{ color: '#1565C0' }}>
                  {report.timeSavings.hoursWithApp} hrs
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: '#42A5F5' }}>Time without app (est.)</Text>
                <Text className="font-bold" style={{ color: '#1565C0' }}>
                  {report.timeSavings.hoursWithoutApp} hrs
                </Text>
              </View>
              <View
                className="rounded-xl p-4 mt-2 items-center"
                style={{ backgroundColor: '#BBDEFB' }}
              >
                <Text style={{ color: '#0D47A1', fontSize: 14 }}>You Saved</Text>
                <Text style={{ color: '#0D47A1', fontSize: 32, fontWeight: 'bold' }}>
                  {report.timeSavings.hoursSaved} hrs
                </Text>
                <Text style={{ color: '#1565C0', fontSize: 12 }}>
                  of aimless driving today!
                </Text>
              </View>
            </View>

            {/* Economic Impact */}
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: '#FFF3E0' }}
            >
              <Text className="text-lg font-bold mb-3" style={{ color: '#E65100' }}>
                🌍 Economic Impact
              </Text>
              <Text style={{ color: '#F57C00', fontSize: 14, lineHeight: 20 }}>
                Your ${report.totalSales.toFixed(2)} in ice cream sales today helped stimulate
                the local economy! Ice Cream Man vendors collectively contribute thousands
                to neighborhood economies every day.
              </Text>
              <View
                className="rounded-xl p-4 mt-3 items-center"
                style={{ backgroundColor: '#FFE0B2' }}
              >
                <Text style={{ color: '#BF360C', fontSize: 12 }}>
                  Economic Multiplier Effect
                </Text>
                <Text style={{ color: '#BF360C', fontSize: 24, fontWeight: 'bold' }}>
                  ${(report.totalSales * 2.5).toFixed(2)}
                </Text>
                <Text style={{ color: '#E65100', fontSize: 11 }}>
                  estimated local economic impact
                </Text>
              </View>
            </View>

            {/* New Report Button */}
            <Pressable
              onPress={() => {
                setSubmitted(false);
                setReport(null);
                setSalesInput('');
                setOrdersInput('');
                setMilesInput('');
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                  marginTop: 8,
                },
              ]}
            >
              <Text className="text-white font-bold text-base">Generate New Report</Text>
            </Pressable>
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
            <Text style={{ fontSize: 50 }}>📊</Text>
            <Text className="text-3xl font-bold text-foreground text-center">
              End of Day Report
            </Text>
            <Text className="text-base text-muted text-center">
              Enter your daily numbers to see how much you saved
            </Text>
          </View>

          {/* Input Form */}
          <View className="bg-surface rounded-2xl p-6 gap-5">
            <View>
              <Text className="text-foreground font-semibold mb-2">
                💰 Total Ice Cream Sales Today ($)
              </Text>
              <TextInput
                value={salesInput}
                onChangeText={setSalesInput}
                placeholder="e.g. 350.00"
                keyboardType="decimal-pad"
                returnKeyType="done"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 18,
                  color: colors.foreground,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            <View>
              <Text className="text-foreground font-semibold mb-2">
                🍦 Number of Orders Completed
              </Text>
              <TextInput
                value={ordersInput}
                onChangeText={setOrdersInput}
                placeholder="e.g. 45"
                keyboardType="number-pad"
                returnKeyType="done"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 18,
                  color: colors.foreground,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            <View>
              <Text className="text-foreground font-semibold mb-2">
                🚚 Miles Driven Today
              </Text>
              <TextInput
                value={milesInput}
                onChangeText={setMilesInput}
                placeholder="e.g. 25"
                keyboardType="decimal-pad"
                returnKeyType="done"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 18,
                  color: colors.foreground,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          {/* Calculate Button */}
          <Pressable
            onPress={calculateReport}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                paddingVertical: 20,
                borderRadius: 16,
                alignItems: 'center',
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text className="text-white text-xl font-bold">Generate My Report</Text>
            <Text className="text-white text-sm opacity-80 mt-1">
              See your gas & time savings
            </Text>
          </Pressable>

          <Text className="text-muted text-xs text-center">
            Your data helps us calculate platform-wide economic impact statistics
            like "$50,000 in ice cream sales have stimulated the economy because of
            The Ice Cream Man app!"
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
