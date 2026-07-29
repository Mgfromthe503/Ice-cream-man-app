# 🍦 The Ice Cream Man

> **Summon ice cream to your neighborhood with one tap.**

> **Canonical repository:** `Mgfromthe503/Ice-cream-man-app`
>
> This is the single source of truth for the app. The older `Mgfromthe503/the-ice-cream-man` repository should be treated as historical reference only.
>
> Note: the GitHub repository name (`Ice-cream-man-app`) is separate from the Expo app identity. The canonical Expo slug is `the-ice-cream-man`, the deep-link scheme is `manusapp`, and the Android/iOS bundle ID is `com.icecreamman.app` — all defined in `config/app-identity.js`.

A mobile app that connects ice cream truck drivers with customers in real-time. Customers tap a button to summon the nearest ice cream truck, and drivers receive instant requests with navigation to the customer's location.

---

## ⚙️ Canonical App Configuration

| Key | Value |
|-----|-------|
| **Expo app config** | `app.config.ts` |
| **EAS build config** | `eas.json` |
| **App identity constants** | `config/app-identity.js` |
| **Slug** | `the-ice-cream-man` |
| **Deep-link scheme** | `manusapp` |
| **iOS bundle ID / Android package** | `com.icecreamman.app` |
| **EAS project ID** | `a7392ba6-c4a2-455d-b03c-9bc0233b7b12` |

`app.config.ts` is the canonical place for Expo/EAS configuration. All identity constants are centralised in `config/app-identity.js` so they are shared across the app config, deep-link config, and tests.

---

## 🔄 Release Workflow

The CI/CD pipeline lives in `.github/workflows/eas-build-submit.yml` and behaves as follows:

| Event | Validate | Build | Submit to Play |
|-------|----------|-------|---------------|
| Pull request → `main` | ✅ | ❌ | ❌ |
| Push to `main` | ✅ | ✅ | ✅ (if secret set) |
| Manual dispatch | ✅ | ✅ | configurable |

**Required GitHub secrets:**
- `EXPO_TOKEN` — Expo personal access token (required for every build)
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` — Google Play service account JSON (required for auto-submit; omit to skip submission gracefully)


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

## 📋 Google Play Store Deployment

### Required Assets (included in `/legal/`)
- ✅ Privacy Policy
- ✅ Terms of Service
- ✅ Data Safety Form declarations
- ✅ Store listing description with screenshots
- ✅ App icon (512x512)
- ✅ Feature graphic (1024x500)

### Build & Deploy

```bash
# Local release validation
pnpm check
pnpm test

# Android release build (via EAS)
eas build --platform android --profile production

# Submit latest Android build to Google Play internal track
eas submit --platform android --latest
```

1. Fill in store listing from `legal/GOOGLE_PLAY_LISTING.md`
2. Set up in-app product: `icm_vendor_registration` at $25.00
3. Submit for review

### Credentials & Signing

- Android signing uses **EAS-managed credentials** (no `.jks` files committed).
- `EXPO_TOKEN` and the Google Play service-account JSON belong in **GitHub Secrets**, not in the repository.
- Never commit keystores, service-account JSON files, `.env` files, or other credentials.

---

## 📄 Legal

- [Privacy Policy](legal/PRIVACY_POLICY.md)
- [Terms of Service](legal/TERMS_OF_SERVICE.md)
- [Data Safety](legal/DATA_SAFETY.md)

---

## 👩‍💻 Developer

**Mindy Gaines**
Portland, OR

---

## 📜 License

All rights reserved. This is proprietary software.
