import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

const APP_NAME = 'The Ice Cream Man';
const EFFECTIVE_DATE = 'June 29, 2026';
const LAST_UPDATED = 'August 26, 2026';
const CONTACT_EMAIL = 'mindy.gaines1@gmail.com';

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']} className="p-0">
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingRight: 16 }]}
        >
          <Text style={{ fontSize: 28, color: colors.primary }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={{ fontSize: 23, fontWeight: '800', color: colors.foreground, marginBottom: 6 }}>{APP_NAME}</Text>
        <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 20, marginBottom: 20 }}>
          Privacy Policy{`\n`}Effective Date: {EFFECTIVE_DATE}{`\n`}Last Updated: {LAST_UPDATED}{`\n`}Developer: Mindy Gaines{`\n`}Package: com.icecreamman.app
        </Text>

        <PolicySection title="1. Introduction" colors={colors}>
          {APP_NAME} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our mobile application. By downloading, installing, or using the App, you agree to the collection and use of information described here.
        </PolicySection>

        <PolicySection title="2. User roles" colors={colors}>
          The App supports Customers who request ice cream delivery and Drivers/Vendors who receive and fulfill delivery requests. Customers may share a selected level of location information with an assigned Driver. Drivers share real-time GPS location for request matching, navigation, ETA estimates, and delivery-completion proximity verification.
        </PolicySection>

        <PolicySection title="3. Information we collect" colors={colors}>
          We may collect account information such as your name, email address, and, for Drivers, coverage area or ZIP code and truck-registration information. We collect device platform, app state, and push-notification token information to support compatibility and delivery alerts.
        </PolicySection>

        <PolicySection title="4. Location data and user choice" colors={colors}>
          Before a Customer request, the Customer chooses one of three sharing options: exact address, street name only, or a custom meetup-point description. Optional delivery instructions are visible only to the assigned Driver during the active delivery. Drivers share their location while the App is active to receive nearby requests, provide ETA information, and support the 1,000-foot delivery-completion check.
        </PolicySection>

        <PolicySection title="5. Temporary location caching and deletion" colors={colors}>
          Customer location data may be cached locally on a Driver device through secure local storage solely during active navigation. When a delivery is completed or cancelled, the App is designed to delete the cached address, coordinates, delivery instructions, meetup description, and navigation data. No customer location history is retained for Drivers after the active delivery ends.
        </PolicySection>

        <PolicySection title="6. Payment information" colors={colors}>
          Google Play Billing processes the one-time $25 Driver registration fee. We do not collect, store, or process credit-card numbers, bank-account details, or other financial credentials. We retain only transaction metadata needed for receipt verification and a purchase-verification token protected by the device Keychain or Keystore.
        </PolicySection>

        <PolicySection title="7. How we use information" colors={colors}>
          We use information to authenticate accounts, match Customers and Drivers, support active delivery navigation, calculate proximity and ETA, send delivery notifications, verify the Driver registration purchase, maintain security, prevent abuse, and respond to legal requests. Customer delivery coordinates and instructions are used only for the active delivery and are designed to be deleted when that delivery ends.
        </PolicySection>

        <PolicySection title="8. Sharing and disclosure" colors={colors}>
          We do not sell, rent, or share personal data for advertising, analytics, or marketing. During an active delivery, the assigned Driver may receive the Customer’s selected location information and instructions, while the Customer may receive the Driver’s first name and ETA. Google Play Billing receives transaction information for the registration purchase. OpenStreetMap Nominatim may receive coordinates for reverse geocoding without user identity. We may disclose information when required by law or valid government process.
        </PolicySection>

        <PolicySection title="9. Data security" colors={colors}>
          We use security controls that may include HTTPS-only network access, security headers, rate limiting, input sanitization, purchase-token validation, device Keychain/Keystore protection, coordinate validation, lifecycle-aware polling, and deletion of temporary delivery data when an order is completed or cancelled. No security measure can guarantee absolute protection.
        </PolicySection>

        <PolicySection title="10. Location access while the App is active" colors={colors}>
          The current Android release requests foreground location only. It does not request Android background-location permission and does not run a location foreground service. You may decline location permission; the App will use documented fallback behavior where available. Any future background-location feature would require this policy and the applicable Play Console declarations to be updated first.
        </PolicySection>

        <PolicySection title="11. Children and guardians" colors={colors}>
          The App is a general-audience Food & Drink dispatch service and is not designed for a child to independently arrange a real-world delivery or share location details. The App displays a safety reminder encouraging parent or guardian awareness and the least precise location-sharing option that works. This reminder is not age verification or verifiable parental consent. A parent or guardian may contact us to request deletion of information provided by a child without permission.
        </PolicySection>

        <PolicySection title="12. Vendor screening" colors={colors}>
          The App does not perform background checks, criminal-history checks, driving-record checks, or other screening on registering vendors. Users interact with vendors at their own discretion and should use normal precautions.
        </PolicySection>

        <PolicySection title="13. Your rights and choices" colors={colors}>
          You may request access to, correction of, deletion of, or a copy of your personal information by contacting us. You can change location-sharing choices for each order and disable location permission through device settings. California residents may have rights to know what information is collected, know whether it is sold or disclosed, opt out of sale, and receive equal treatment when exercising privacy rights. We do not sell personal information.
        </PolicySection>

        <PolicySection title="14. Changes to this policy" colors={colors}>
          We may update this Privacy Policy from time to time. We will update the Last Updated date and make the revised policy available in the App. Material changes may also be communicated through the App or by email where appropriate.
        </PolicySection>

        <PolicySection title="15. Contact us" colors={colors}>
          For privacy questions, access or deletion requests, contact {CONTACT_EMAIL}. Developer: Mindy Gaines. App: {APP_NAME}. Location: Beaverton, Oregon, United States.
        </PolicySection>

        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 4 }}>
          By using {APP_NAME}, you acknowledge that you have read and understood this Privacy Policy.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [{ backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>← Back</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

function PolicySection({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 22 }}>{children}</Text>
    </View>
  );
}
