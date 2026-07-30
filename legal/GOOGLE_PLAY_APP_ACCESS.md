# Google Play Console — App Access Instructions

**Paste this into: Google Play Console → App Content → App Access**

---

## App Access Type: All functionality is available without special access

The Ice Cream Man is a dual-marketplace app with two user roles (Customer and Driver). Both roles are accessible from the home screen without any login requirement for basic testing. Below are instructions for testing each flow.

---

## Testing Instructions for Reviewers

### CUSTOMER FLOW (No Login Required)

1. Open the app
2. Tap **"Tap to Order Ice Cream →"** on the Customer card
3. The customer home screen displays with a large pulsing **"I WANT ICE CREAM!"** button
4. Tap the button to initiate an order
5. The app will request location permission — grant it
6. Choose a delivery share mode (Exact Address / Street Only / Meetup Point)
7. Optionally add delivery instructions
8. Confirm the order
9. The summoning animation plays with rotating ice cream facts
10. After ~20 seconds, the simulated delivery completes

### DRIVER/VENDOR FLOW (Registration Required — $25 Fee)

1. Open the app
2. Tap **"Start Earning Money →"** on the Ice Cream Vendor card
3. You will see the **"Register Your Truck First!"** screen
4. Tap **"Register My Truck"**
5. Fill in: Name, Truck Name, Truck Color (truck number auto-assigned)
6. After registration form, the **$25 Google Play Billing** payment screen appears
7. Complete payment via Google Play test card (use a license tester account)
8. After payment, enter a zip/area code to set your coverage zone
9. The dashboard shows incoming customer requests (if any are waiting)
10. Accept a request → Navigate button opens Google Maps with directions
11. Complete delivery when within 1000 feet of customer

### TEST ACCOUNTS FOR REVIEW (Pre-Configured — No Payment Required)

Two test accounts are pre-configured that bypass all registration and payment flows:

**How to access the test login screen:**
1. On the initial role-select screen ("Choose your role to get started")
2. Scroll to the bottom
3. Tap the small gray **"v1.0.0"** version text at the very bottom of the screen
4. This opens the hidden Test Login screen

**Customer Test Account:**
| Field | Value |
|-------|-------|
| Email | Icecream@customertest.com |
| Password | GoogleTest2026! |

This account bypasses all verification and lands directly on the Customer ordering screen.

**Driver Test Account:**
| Field | Value |
|-------|-------|
| Email | Icecream@driverlogintest.com |
| Password | GoogleTest2026! |

This account bypasses the $25 registration fee, email verification, and all activation checks. It lands directly on the operational Driver Dashboard with a pre-registered truck (ICM-9999, area code 97005), ready to accept incoming customer requests.

**Alternative (License Tester for real billing flow):**
If you want to test the actual $25 Google Play Billing flow, add your reviewer's Google account as a License Tester in Google Play Console (Setup → License testing) with Payment Response set to RESPOND_NORMALLY (uses test card, no real charge).

### DEMO MODE (If No Active Drivers Available)

When testing the Customer flow, if no real Drivers are online, the app uses a simulated delivery timeline:
- 8 seconds: Driver accepts your order
- 15 seconds: Driver is nearby
- 20 seconds: Delivery arrives

This ensures the reviewer can experience the full customer journey without needing a second device.

---

## Key Features to Verify

| Feature | Where to Find |
|---------|---------------|
| Location permission prompt | Customer order flow (with prominent disclosure modal shown first) |
| Google Play Billing ($25 fee) | Driver registration flow |
| Push notifications | Driver receives alert when customer orders |
| Maps navigation | Driver dashboard → Accept request → Navigate button |
| Privacy controls | Customer chooses Exact/Street/Meetup before each order |
| Data deletion | Customer location wiped from Driver device on delivery completion |
| Battery optimization | Polling pauses when app is backgrounded |

---

## Privacy Policy URL

Host the Privacy Policy at a publicly accessible URL before submitting to Play Console.
Options (choose one):
- GitHub Pages: `https://mgfromthe503.github.io/Ice-cream-man-app/legal/PRIVACY_POLICY`
- Your own domain: `https://theicecreamman.app/privacy`

Enter this URL in Google Play Console under **App content > Privacy policy**.

(Also accessible in-app via Profile screens)

---

## Data Safety Declarations

| Question | Answer |
|----------|--------|
| Does your app collect or share user data? | Yes |
| Is all collected data encrypted in transit? | Yes (HTTPS/TLS) |
| Do you provide a way for users to request data deletion? | Yes (email request) |
| Does your app collect precise location? | Yes (for delivery navigation) |
| Does your app collect approximate location? | Yes (for area matching) |
| Is location data shared with other users? | Yes (Customer → Driver during active delivery only) |
| Is location data processed ephemerally? | Yes (deleted on delivery completion) |

---

*This document is ready to paste into Google Play Console's App Access section.*
