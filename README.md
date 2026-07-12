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

## 📋 Google Play Store Deployment

### Required Assets (included in `/legal/`)
- ✅ Privacy Policy
- ✅ Terms of Service
- ✅ Data Safety Form declarations
- ✅ Store listing description with screenshots
- ✅ App icon (512x512)
- ✅ Feature graphic (1024x500)

### Build & Deploy
1. Click **Publish** in the Manus UI to generate APK/AAB
2. Upload AAB to Google Play Console
3. Fill in store listing from `legal/GOOGLE_PLAY_LISTING.md`
4. Set up in-app product: `icm_vendor_registration` at $25.00
5. Submit for review

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

---

Migration notes

This repository has been prepared to be moved into a merged monorepo under the path `app/`.
Key changes in the `merge/move-app` branch:
- Project-level files (package.json, tsconfig.json, server, components, assets, scripts, etc.) were moved into the top-level `app/` folder so the application is self-contained.
- TypeScript path aliases ("@/*" and "@shared/*") remain relative and will continue to work when `app/` is placed inside a monorepo, because the config files are moved alongside the code.

Verification after transplanting into the monorepo
1. Copy the `app/` folder into the monorepo root (resulting in `<monorepo>/app/`).
2. From monorepo root, install dependencies and run the app using one of the following approaches:
   - Run commands from the `app/` directory: `cd app && pnpm install && pnpm dev`
   - Or run from monorepo root with workspace-aware pnpm: `pnpm --filter ./app... install` then `pnpm --filter ./app... dev` (or use `working-directory: app` in CI).
3. Confirm the server and Expo metro start: `pnpm dev` (starts server and metro concurrently) and open Expo as usual.

If issues arise, review MIGRATION_FILE_MAP.md at repository root for file locations and the PR discussion for follow-up steps.
