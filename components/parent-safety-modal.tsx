import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

interface ParentSafetyModalProps {
  visible: boolean;
  acknowledged: boolean;
  onAcknowledgedChange: (acknowledged: boolean) => void;
  onContinue: () => void;
  onClose: () => void;
  continueLabel: string;
}

/**
 * A plain-language, child-friendly safety reminder shown before a customer can
 * share a location and request a neighborhood visit. This is an acknowledgment,
 * not age verification or a substitute for adult supervision.
 */
export function ParentSafetyModal({
  visible,
  acknowledged,
  onAcknowledgedChange,
  onContinue,
  onClose,
  continueLabel,
}: ParentSafetyModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.58)' }}>
        <View className="bg-background rounded-t-3xl" style={{ maxHeight: '88%' }}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <View className="items-center mb-3">
              <Text style={{ fontSize: 48 }}>🛟🍦</Text>
            </View>

            <Text className="text-2xl font-bold text-foreground text-center mb-2">
              A Sweet Safety Reminder
            </Text>
            <Text className="text-sm text-muted text-center leading-5 mb-5">
              Summoning the truck is cool. Making your grown-up mad? Not the vibe. Ask a parent or guardian before requesting an ice cream visit to your neighborhood.
            </Text>

            <View className="bg-primary/10 border border-primary/25 rounded-2xl p-4 mb-4">
              <Text className="text-sm font-bold text-foreground mb-2">Smart scoop rules</Text>
              <Text className="text-sm text-foreground leading-6">
                🧑‍🧑‍🧒 Let a parent or guardian know before you order.{`\n`}
                📍 Choose Street Name Only or a familiar public meetup spot when possible.{`\n`}
                👀 Wait with a trusted adult and watch for cars and driveways.{`\n`}
                🔒 Keep phone numbers, school details, and other private information out of notes.{`\n`}
                🛑 If anything feels wrong, cancel the request and tell a trusted adult.
              </Text>
            </View>

            <View className="bg-warning/15 border border-warning/30 rounded-2xl p-4 mb-5">
              <Text className="text-xs text-foreground leading-5">
                <Text className="font-bold">Use good judgment.</Text> This app helps request a neighborhood ice-cream visit; it does not replace a parent or guardian’s supervision, local rules, or your own awareness of your surroundings.
              </Text>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acknowledged }}
              onPress={() => onAcknowledgedChange(!acknowledged)}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              className={`flex-row gap-3 p-4 rounded-2xl border mb-4 ${acknowledged ? 'bg-success/10 border-success' : 'bg-surface border-border'}`}
            >
              <Text style={{ fontSize: 22 }}>{acknowledged ? '☑️' : '⬜'}</Text>
              <Text className="flex-1 text-sm text-foreground leading-5">
                A parent or guardian knows I am about to request an ice cream visit, and I will use the safer sharing choices when I can.
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !acknowledged }}
              disabled={!acknowledged}
              onPress={onContinue}
              style={({ pressed }) => [{ opacity: !acknowledged ? 0.45 : pressed ? 0.82 : 1 }]}
            >
              <View className="bg-primary rounded-xl p-4 mb-3">
                <Text className="text-white font-bold text-center text-base">{continueLabel}</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className="text-muted text-center font-medium p-3">Not now</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
