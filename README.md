# The Ice Cream Man

> Summon ice cream to your neighborhood with one tap.

A mobile app that connects ice cream truck drivers with customers in real time. Customers tap a button to summon the nearest truck; drivers get the request and navigate to the customer.

**Repo:** [Mgfromthe503/Ice-cream-man-app](https://github.com/Mgfromthe503/Ice-cream-man-app)

---

## App identity

| Key | Value |
|-----|-------|
| Expo slug | `the-ice-cream-man` |
| Bundle ID / package | `com.icecreamman.app` |
| Deep-link scheme | `manusapp` |
| EAS project ID | `a7392ba6-c4a2-455d-b03c-9bc0233b7b12` |
| Expo owner | `Mgfromthe503` |

All of these live in `config/app-identity.js` and are imported by `app.config.ts` and OAuth config so they never drift.

---

## Features

**Customers**
- One-tap summon
- Real-time truck tracking
- Fun facts + jingle when the truck is near
- Ratings and order history

**Drivers**
- Incoming request alerts
- One-tap navigation
- Daily earnings / gas / mileage reports
- $25 one-time registration via Google Play Billing

---

## Tech stack

| Layer | Stack |
|-------|--------|
| App | React Native + Expo SDK 54, TypeScript, Expo Router |
| UI | NativeWind 4, Reanimated 4 |
| Backend | Express + tRPC |
| DB | MySQL + Drizzle ORM |
| Payments | Google Play Billing (`react-native-iap`) |

---

## Local development

**Requirements:** Node 20+, pnpm 9+

```bash
git clone https://github.com/Mgfromthe503/Ice-cream-man-app.git
cd Ice-cream-man-app
pnpm install
pnpm dev
```

- `pnpm check` — TypeScript
- `pnpm test` — Vitest

Scan the Expo QR code with Expo Go, or use a development build for native modules (billing, etc.).

---

## Build & release (EAS)

Profiles are defined in `eas.json`:

| Profile | Output | Use |
|---------|--------|-----|
| `development` | Debug APK + dev client | Local device testing |
| `preview` | Internal APK | QA / stakeholders |
| `production` | AAB | Google Play |

```bash
# Production Android bundle
eas build --platform android --profile production

# Optional: submit latest build to Play internal track
eas submit --platform android --profile production
```

### GitHub Actions

Workflow: `.github/workflows/eas-build-submit.yml`

| Event | Validate | Build | Submit |
|-------|----------|-------|--------|
| PR → `main` | Yes | No | No |
| Push → `main` | Yes | Yes (production) | Yes if secret present |
| Manual dispatch | Yes | Yes | Configurable |

**GitHub Secrets**
- `EXPO_TOKEN` — required for builds
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` — optional; enables auto-submit

Android signing is **EAS-managed**. Do not commit keystores or service-account JSON.

---

## Project layout

```
app/                 # Expo Router screens (customer + driver)
components/          # UI (summon animation, map, ratings, etc.)
config/              # Canonical app identity
constants/           # OAuth + theme
server/              # Express + tRPC API
legal/               # Privacy, terms, Play listing copy
tests/               # Vitest suites
```

---

## Legal & store listing

- [Privacy Policy](legal/PRIVACY_POLICY.md)
- [Terms of Service](legal/TERMS_OF_SERVICE.md)
- [Data Safety](legal/DATA_SAFETY.md)
- [Play Store listing copy](legal/GOOGLE_PLAY_LISTING.md)

In-app product: `icm_vendor_registration` — $25.00 one-time.

---

## License

Proprietary. All rights reserved.
