import { View, Text, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

export default function DriverEarningsScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Earnings</Text>
            <Text className="text-sm text-muted">Your income summary</Text>
          </View>

          {/* Total Earnings */}
          <View className="bg-primary rounded-2xl p-6 gap-2">
            <Text className="text-sm text-white opacity-80">Total Earnings</Text>
            <Text className="text-4xl font-bold text-white">$245.50</Text>
            <Text className="text-sm text-white opacity-80">32 deliveries completed</Text>
          </View>

          {/* Stats Grid */}
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-xs text-muted mb-1">Today</Text>
                <Text className="text-2xl font-bold text-primary">$45.00</Text>
                <Text className="text-xs text-muted mt-1">8 deliveries</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-xs text-muted mb-1">This Week</Text>
                <Text className="text-2xl font-bold text-success">$185.00</Text>
                <Text className="text-xs text-muted mt-1">28 deliveries</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-xs text-muted mb-1">Avg per Delivery</Text>
                <Text className="text-2xl font-bold text-warning">$5.00</Text>
                <Text className="text-xs text-muted mt-1">Consistent rate</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-xs text-muted mb-1">Rating</Text>
                <Text className="text-2xl font-bold text-success">4.9 ⭐</Text>
                <Text className="text-xs text-muted mt-1">From 32 reviews</Text>
              </View>
            </View>
          </View>

          {/* Recent Transactions */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Recent Transactions</Text>
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm font-semibold text-foreground">Delivery to 123 Main St</Text>
                  <Text className="text-xs text-muted">Today at 2:30 PM</Text>
                </View>
                <Text className="text-sm font-bold text-success">+$5.00</Text>
              </View>
            </View>
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm font-semibold text-foreground">Delivery to 456 Oak Ave</Text>
                  <Text className="text-xs text-muted">Today at 1:45 PM</Text>
                </View>
                <Text className="text-sm font-bold text-success">+$5.00</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
