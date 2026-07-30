# 🍦 The Ice Cream Man

> **Summon ice cream to your neighborhood with one tap.**

A mobile app that connects ice cream truck drivers with customers in real time. Customers tap a big ice cream button to summon the nearest truck; drivers get the request and navigate straight to the customer — no more aimless cruising, no more missing the truck.

[![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

**Repo:** [Mgfromthe503/Ice-cream-man-app](https://github.com/Mgfromthe503/Ice-cream-man-app)

---

## Why this app exists

| Side | Old problem | With The Ice Cream Man |
|------|-------------|-------------------------|
| **Customers** | Guess when the truck might pass by | One-tap summon + live tracking |
| **Drivers** | Drive around hoping to find people | Requests come to you with GPS |
| **Everyone** | Waste time and gas | Location-matched, efficient service |

---

## Features

### For customers
- **One-tap summoning** — giant ice cream button calls the nearest truck
- **Real-time tracking** — watch the truck approach on a candy-land style map
- **Fun facts** — rotating ice cream trivia while you wait
- **Jingle alert** — classic ice cream truck jingle when the truck is near
- **Rate your driver** — star ratings after each delivery
- **Order history** — past requests and deliveries in one place

### For ice cream vendors
- **Incoming request alerts** — notified when customers nearby want ice cream
- **One-tap navigation** — directions straight to the customer
- **Daily reports** — earnings, mileage, gas costs, hourly rate
- **Earnings dashboard** — income over time (with vs. without the app)
- **$25 one-time registration** — via Google Play Billing (`icm_vendor_registration`)
- **Drivers Wanted banner** — recruits new drivers when demand is high

### Smart economics (drivers)
- Hourly rate calculator (app vs. driving around)
- Gas cost tracking from daily prices + mileage
- Clear picture of time and fuel saved

---

## App identity

Single source of truth: `config/app-identity.js` (imported by `app.config.ts` and OAuth config).

| Key | Value |
|-----|-------|
| App name | `The Ice Cream Man` |
| Expo slug | `the-ice-cream-man` |
| Bundle ID / package | `com.icecreamman.app` |
| Deep-link scheme | `manusapp` |
| EAS project ID | `a7392ba6-c4a2-455d-b03c-9bc0233b7b12` |
| Expo owner | `mgfromthe503` |

Expo usernames are **case-sensitive** for EAS project resolution — the owner must match the account that owns the projectId.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| App | React Native + Expo SDK 54, TypeScript |
| Navigation | Expo Router 6 (file-based) |
| UI | NativeWind 4, Reanimated 4 |
| Backend | Express + tRPC |
| Database | MySQL + Drizzle ORM |
| Payments | Google Play Billing (`react-native-iap`) |
| Audio | expo-audio (jingle) |
| Tests | Vitest |
| Builds | EAS Build + Submit |
| Package manager | pnpm 9 (workspace monorepo) |

---

## Design (candy-land theme)

| Token | Color |
|-------|--------|
| Primary | `#FFB6D9` Candy Pink |
| Secondary | `#A8E6CF` Mint Green |
| Accent | `#FFD3B6` Peach |
| Background | `#FFFACD` Lemon Chiffon |
| Text | `#8B4513` Saddle Brown |

Rounded buttons, soft cards, pastel map styling, emoji-friendly icons. Theme tokens live in `theme.config.js`.

---

## Local development

**Requirements:** Node **22+**, pnpm 9+

```bash
git clone https://github.com/Mgfromthe503/Ice-cream-man-app.git
cd Ice-cream-man-app
pnpm install
pnpm dev
```

| Command | Purpose |
|---------|---------|
| `pnpm check` | TypeScript |
| `pnpm test` | Vitest |
| `pnpm dev` | Server + Metro (concurrent) |
| `pnpm build` | Bundle server for production |
| `pnpm start` | Run production server |

Scan the Expo QR code with Expo Go, or use a development build for native modules (billing, etc.).

---

## Build & release (EAS)

Profiles in `eas.json`:

| Profile | Output | Use |
|---------|--------|-----|
| `development` | Debug APK + dev client | Local device testing |
| `preview` | Internal APK | QA / stakeholders |
| `production` | AAB | Google Play |

```bash
eas build --platform android --profile production
eas submit --platform android --profile production
```

### GitHub Actions

Workflow: `.github/workflows/eas-build-submit.yml`

| Event | Validate (types + tests) | EAS Build | Submit |
|-------|--------------------------|-----------|--------|
| PR → `main` | Yes | No | No |
| Push → `main` | Yes | No | No |
| Manual `workflow_dispatch` | Yes | Yes (if `EXPO_TOKEN` set) | Optional |

Push/PR CI only validates so Actions stays green while you choose when to spend EAS minutes. Trigger a production build from **Actions** → **EAS Build and Submit** → **Run workflow**.

**Secrets** (Settings → Secrets and variables → Actions)

- `EXPO_TOKEN` — required for builds ([create token](https://expo.dev/settings/access-tokens))
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` — optional; enables auto-submit to Play internal track

Android signing is **EAS-managed**. Do not commit keystores or service-account JSON.

---

## Monetization

- **$25 one-time** driver registration via Google Play Billing
- Product ID: `icm_vendor_registration`
- No recurring fees for drivers or customers
- Revenue goes to the Google Play Developer account (Google’s standard commission applies)

---

## Project layout (monorepo)

This is a **pnpm workspace monorepo**. The Expo app and Express API share one root package today; `packages/*` is reserved for future shared libraries.

```
pnpm-workspace.yaml   # workspace definition (root + packages/*)
package.json          # root scripts: dev, check, test, build, start
app/                  # Expo Router screens (customer + driver)
components/           # UI (summon animation, map, ratings, jingle, banners)
config/               # Canonical app identity (owner, slug, projectId)
constants/            # OAuth + theme
server/               # Express + tRPC API
shared/               # Shared types/errors between app and server
drizzle/              # Schema + migrations
legal/                # Privacy, terms, data safety, Play listing copy
tests/                # Vitest suites
packages/             # Future shared packages (empty for now)
eas.json              # EAS build/submit profiles (Node 22)
render.yaml           # Optional API deploy on Render
.github/workflows/    # Validate on PR/push; EAS on workflow_dispatch
```

---

## Legal & store listing

- [Privacy Policy](legal/PRIVACY_POLICY.md)
- [Terms of Service](legal/TERMS_OF_SERVICE.md)
- [Data Safety](legal/DATA_SAFETY.md)
- [Play Store listing copy](legal/GOOGLE_PLAY_LISTING.md)
- [App access notes](legal/GOOGLE_PLAY_APP_ACCESS.md)

---

## Developer

**Mindy Gaines** · Portland, OR  
GitHub: [@Mgfromthe503](https://github.com/Mgfromthe503)

---

## License

Proprietary. All rights reserved.
