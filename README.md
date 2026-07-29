# 🍦 The Ice Cream Man

> **Summon ice cream to your neighborhood with one tap.**

A mobile app that connects ice cream truck drivers with customers in real-time. Customers tap a button to summon the nearest ice cream truck, and drivers receive instant requests with navigation to the customer's location.

---

## 📱 Features

### For Customers
- **One-Tap Summoning** — Tap the big ice cream button to call the nearest truck
- **Real-Time Tracking** — Watch the ice cream truck approach on the map
- **Fun Facts** — Rotating ice cream trivia while you wait
- **Jingle Alert** — Hear the classic ice cream truck jingle when your truck arrives
- **Rate Your Driver** — Star ratings after each delivery
- **Order History** — Track all your past ice cream orders

### For Ice Cream Vendors
- **Incoming Requests** — Get notified when customers nearby want ice cream
- **GPS Navigation** — One-tap directions to the customer's neighborhood
- **Daily Reports** — Track earnings, mileage, gas costs, and hourly rate
- **Earnings Dashboard** — See your income over time with app vs. without-app comparison
- **Driver Registration** — $25 one-time fee via Google Play Billing
- **Supply/Demand Alerts** — "Drivers Wanted!" banner recruits new drivers when demand is high

### Smart Economics
- **Hourly Rate Calculator** — Compare your $/hour with the app vs. driving around aimlessly
- **Gas Cost Tracking** — Input daily gas prices and mileage for accurate profit calculations
- **Time Savings** — See exactly how much time you save by having customers come to you

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native + Expo SDK 54 |
| **Language** | TypeScript 5.9 |
| **Navigation** | Expo Router 6 (file-based) |
| **Styling** | NativeWind 4 (Tailwind CSS) |
| **Animations** | React Native Reanimated 4 |
| **State** | React Context + AsyncStorage |
| **Backend** | Express + tRPC |
| **Database** | PostgreSQL + Drizzle ORM |
| **Payments** | Google Play Billing (react-native-iap) |
| **Maps** | Google Maps / Apple Maps (via Linking) |
| **Audio** | expo-audio (jingle playback) |

---

## 📂 Project Structure

```
app/
├── role-select.tsx          # Entry: Customer or Vendor?
├── (customer)/
│   ├── index.tsx            # Summoning screen with big ice cream button
│   ├── history.tsx          # Order history
│   └── profile.tsx          # Settings, rate app, logout
├── (driver)/
│   ├── index.tsx            # Dashboard with incoming requests
│   ├── register.tsx         # Driver registration form
│   ├── payment.tsx          # $25 Google Play Billing
│   ├── daily-report.tsx     # End-of-day earnings calculator
│   ├── earnings.tsx         # Historical earnings view
│   ├── map.tsx              # Active delivery map
│   └── profile.tsx          # Driver profile & settings
components/
├── summoning-animation.tsx  # Animated summoning with facts & jingle
├── fact-ticker.tsx          # Rotating fun facts component
├── ratings-prompt.tsx       # Star rating modal (triggers Play Store review)
├── drivers-wanted-banner.tsx # Supply/demand recruitment banner
└── share-button.tsx         # Social sharing for driver recruitment
server/
├── routers.ts               # tRPC API router
├── routers-requests.ts      # Ice cream request handling
├── routers-payment.ts       # Payment verification
└── db.ts                    # Database schema & connection
legal/
├── PRIVACY_POLICY.md        # Google Play compliant privacy policy
├── TERMS_OF_SERVICE.md      # Terms of service
├── DATA_SAFETY.md           # Data safety declarations
└── GOOGLE_PLAY_LISTING.md   # Store listing copy & metadata
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+
- Expo Go app (for device testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mgfromthe503/Ice-cream-man-app.git
cd Ice-cream-man-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Running on Device
1. Install **Expo Go** from the App Store or Google Play
2. Scan the QR code shown in terminal
3. The app loads on your device

---

## 💰 Monetization

- **$25 one-time driver registration fee** via Google Play Billing
- Revenue goes directly to developer's Google Play Developer account
- Google takes 15% ($3.75), developer receives $21.25 per registration
- No recurring fees for drivers or customers

---

## 🚀 Build & Deploy (Expo + EAS)

Release automation is handled by the GitHub Actions EAS workflow:

- **Pull requests** run validation only (`pnpm check`, `pnpm test`)
- **Pushes to `main`** trigger a production Android EAS build (`.aab`)
- **Manual dispatch** supports `production` and `preview` builds, with optional Google Play submission when enabled

### Local release validation

```bash
pnpm check
pnpm test
```

### Build with EAS

```bash
eas build --platform android --profile production
eas build --platform android --profile preview
```

### Optional Google Play submission

```bash
eas submit --platform android --profile production
```

Use `legal/GOOGLE_PLAY_LISTING.md` for Play Store listing metadata.

### Required secrets

- `EXPO_TOKEN` (required for Expo/EAS authentication)
- `EAS_PROJECT_ID` (required for CI-managed EAS builds)
- `GOOGLE_SERVICE_ACCOUNT_KEY` (required only when Google Play submission is enabled)

### Signing

Android releases use EAS-managed signing credentials. Never commit keystores, service-account JSON, `.env` files, or other secrets.

---

## 📄 Legal

- [Privacy Policy](legal/PRIVACY_POLICY.md)
- [Terms of Service](legal/TERMS_OF_SERVICE.md)
- [Data Safety](legal/DATA_SAFETY.md)

---

## 📜 License

All rights reserved. This is proprietary software.
