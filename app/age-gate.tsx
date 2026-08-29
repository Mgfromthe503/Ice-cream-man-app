import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Image as ExpoImage } from "expo-image";
import { setAgeGroup } from "@/lib/age-gate";
import { useAuth } from "@/lib/auth-context";

/**
 * Mandatory age gate shown before the app can be used.
 *
 * The Ice Cream Man is a 13+ app. Confirmations are persisted per device. Anyone
 * under 13 cannot use the app and is asked to step back — the app never collects
 * location or any data from anyone under 13.
 */
export default function AgeGateScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isUnder13, setIsUnder13] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmIs13Plus = async () => {
    setIsConfirming(true);
    try {
      await setAgeGroup("13_plus");
      router.replace(isAuthenticated ? "/role-select" : "/login");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#FFF8DC", "#FFE4E1", "#FFB6D9", "#FF69B4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScreenContainer className="p-5" containerClassName="bg-transparent">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
            <View style={{ flex: 1, gap: 20, justifyContent: "center" }}>
              <View style={{ alignItems: "center", gap: 8 }}>
                <ExpoImage
                  source={require("@/assets/images/icon.png")}
                  style={{ width: 120, height: 120, borderRadius: 26 }}
                  contentFit="cover"
                />
                <Text style={{ fontSize: 26, fontWeight: "900", color: "#8B4513", textAlign: "center" }}>
                  Welcome to The Ice Cream Man!
                </Text>
                <Text style={{ fontSize: 14, color: "#A0522D", textAlign: "center", lineHeight: 20 }}>
                  One quick question before we start.
                </Text>
              </View>

              {!isUnder13 ? (
                <View style={{ gap: 16 }}>
                  <View
                    style={{
                      gap: 14,
                      backgroundColor: "rgba(255,255,255,0.92)",
                      borderRadius: 20,
                      padding: 22,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "700", color: "#333", textAlign: "center" }}>
                      Are you 13 or older?
                    </Text>
                    <Text style={{ fontSize: 13, color: "#666", lineHeight: 19, textAlign: "center" }}>
                      The Ice Cream Man is for people 13 and older. Someone under 13 must not use the
                      app or share any location with it.
                    </Text>

                    {/* Confirmed 13+ path */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="I am 13 or older"
                      onPress={handleConfirmIs13Plus}
                      disabled={isConfirming}
                      style={({ pressed }) => [
                        {
                          backgroundColor: "#FF69B4",
                          paddingVertical: 15,
                          borderRadius: 14,
                          alignItems: "center",
                          opacity: pressed ? 0.9 : isConfirming ? 0.6 : 1,
                        },
                      ]}
                    >
                      {isConfirming ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
                          Yes, I'm 13 or older
                        </Text>
                      )}
                    </Pressable>

                    {/* Under 13 path */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="I am under 13"
                      onPress={() => setIsUnder13(true)}
                      disabled={isConfirming}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Text style={{ color: "#A0522D", textAlign: "center", fontSize: 14, fontWeight: "600", paddingVertical: 6 }}>
                        I'm under 13
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={{ fontSize: 11, color: "#8B7355", textAlign: "center", lineHeight: 16 }}>
                    This app does not collect personal information from anyone under 13.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  <View
                    style={{
                      gap: 14,
                      backgroundColor: "rgba(255,255,255,0.94)",
                      borderRadius: 20,
                      padding: 22,
                    }}
                  >
                    <Text style={{ fontSize: 40, textAlign: "center" }}>🙅‍♀️🍦</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: "#333", textAlign: "center" }}>
                      Thanks for checking in!
                    </Text>
                    <Text style={{ fontSize: 13, color: "#666", lineHeight: 20, textAlign: "center" }}>
                      The Ice Cream Man is only for people 13 and older, so please pass the phone back
                      to a grown-up. We never collect location or personal information from anyone
                      under 13.
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Go back"
                      onPress={() => setIsUnder13(false)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                    >
                      <View
                        style={{
                          backgroundColor: "#FF69B4",
                          paddingVertical: 15,
                          borderRadius: 14,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
                          Go back
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </ScreenContainer>
      </LinearGradient>
    </View>
  );
}
