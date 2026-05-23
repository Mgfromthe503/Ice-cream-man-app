import { View, Text, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { CandyMap } from '@/components/candy-map';

export default function DriverMapScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Navigation</Text>
            <Text className="text-sm text-muted">Route to customer location</Text>
          </View>

          {/* Navigation Map */}
          <CandyMap showDriver={true} showCustomer={true} />

          {/* Info Card */}
          <View className="bg-surface rounded-xl p-4 gap-3">
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">📍</Text>
              <View className="flex-1">
                <Text className="text-xs text-muted">Customer Location</Text>
                <Text className="text-sm font-semibold text-foreground">123 Main St</Text>
              </View>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">⏱️</Text>
              <View className="flex-1">
                <Text className="text-xs text-muted">Estimated Time</Text>
                <Text className="text-sm font-semibold text-foreground">5 minutes</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
