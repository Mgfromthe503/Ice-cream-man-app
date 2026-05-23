import { View, Text, ScrollView, FlatList } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

const mockHistory = [
  { id: '1', date: 'Today', time: '2:30 PM', location: '123 Main St', status: 'Completed', price: '$5.00' },
  { id: '2', date: 'Yesterday', time: '3:15 PM', location: '456 Oak Ave', status: 'Completed', price: '$5.00' },
  { id: '3', date: '2 days ago', time: '4:00 PM', location: '789 Pine Rd', status: 'Completed', price: '$5.00' },
];

export default function CustomerHistoryScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">Order History</Text>
          <Text className="text-sm text-muted">Your past ice cream orders</Text>
        </View>

        {/* History List */}
        <FlatList
          data={mockHistory}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-sm font-semibold text-foreground">{item.date}</Text>
                  <Text className="text-xs text-muted">{item.time}</Text>
                </View>
                <View className="bg-success rounded-full px-3 py-1">
                  <Text className="text-xs font-semibold text-white">{item.status}</Text>
                </View>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg">📍</Text>
                  <Text className="text-sm text-foreground">{item.location}</Text>
                </View>
                <Text className="text-sm font-bold text-primary">{item.price}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </ScreenContainer>
  );
}
