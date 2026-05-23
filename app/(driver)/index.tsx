import { View, Text, Pressable, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';

const mockRequests = [
  { id: 1, location: '123 Main St', distance: '0.5 km', payout: '$5.00', time: '2 min ago' },
  { id: 2, location: '456 Oak Ave', distance: '1.2 km', payout: '$5.00', time: '5 min ago' },
  { id: 3, location: '789 Pine Rd', distance: '2.1 km', payout: '$5.00', time: '8 min ago' },
];

export default function DriverDashboardScreen() {
  const colors = useColors();
  const [activeRequest, setActiveRequest] = useState<number | null>(null);
  const [requests, setRequests] = useState(mockRequests);

  // Fetch waiting requests from backend
  const { data: waitingRequests, isLoading } = trpc.requests.getWaiting.useQuery();
  const acceptRequestMutation = trpc.requests.accept.useMutation();
  const completeDeliveryMutation = trpc.driver.completeDelivery.useMutation();

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Call backend to accept request
      await acceptRequestMutation.mutateAsync({ requestId });
      
      setActiveRequest(requestId);
      // Remove accepted request from list
      setRequests(requests.filter((r) => r.id !== requestId));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to accept request:', error);
      Alert.alert('Error', 'Failed to accept request.');
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      if (!activeRequest) return;
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Call backend to complete delivery
      await completeDeliveryMutation.mutateAsync({
        requestId: activeRequest,
        amount: 5.0,
      });
      
      setActiveRequest(null);
      Alert.alert('Success', 'Delivery completed! You earned $5.00');
    } catch (error) {
      console.error('Failed to complete delivery:', error);
      Alert.alert('Error', 'Failed to complete delivery.');
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">🚚 Dashboard</Text>
          <Text className="text-sm text-muted">Incoming ice cream requests</Text>
        </View>

        {/* Active Delivery */}
        {activeRequest && (
          <View className="bg-success rounded-2xl p-6 gap-4">
            <View>
              <Text className="text-lg font-bold text-white mb-1">Active Delivery</Text>
              <Text className="text-sm text-white opacity-90">
                {requests.length + 1} requests in queue
              </Text>
            </View>
            <Pressable
              onPress={handleCompleteDelivery}
              disabled={completeDeliveryMutation.isPending}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            >
              <View className="bg-white rounded-lg p-3">
                <Text className="text-success font-bold text-center">
                  {completeDeliveryMutation.isPending ? 'Completing...' : 'Complete Delivery'}
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Requests List */}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-muted mb-3">
            {requests.length} {requests.length === 1 ? 'Request' : 'Requests'} Available
          </Text>
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="bg-surface rounded-xl p-4 mb-3 border-2 border-primary gap-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-2">
                      <Text className="text-lg">📍</Text>
                      <Text className="text-sm font-semibold text-foreground flex-1">{item.location}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg">📏</Text>
                      <Text className="text-xs text-muted">{item.distance}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-primary mb-1">{item.payout}</Text>
                    <Text className="text-xs text-muted">{item.time}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleAcceptRequest(item.id)}
                  disabled={acceptRequestMutation.isPending}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <View className="bg-primary rounded-lg p-3">
                    <Text className="text-white font-bold text-center">
                      {acceptRequestMutation.isPending ? 'Accepting...' : 'Accept Request'}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
