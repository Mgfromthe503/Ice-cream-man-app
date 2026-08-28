# Checkpoint: Resubmission Ready + Local Testing Setup

**Date:** 2026-08-27  
**Purpose:** Consolidate the multi-repo Expo app into one canonical repo, fix all Google Play policy/legal/code issues, and set up local backend for Expo Go testing.

---

## OBJECTIVE

- Consolidate the user's multi-repo Expo app into ONE canonical repo (`ice-cream-man-app`, package `com.icecreamman.app`).
- Automate the build via EAS/GitHub Actions and get the app resubmitted to Google Play.
- Make the app actually deployable: diagnose/fix the ~90 failed EAS builds, and fix every Google Play policy, legal, code, data-safety, and security issue that caused rejections.

---

## IMPORTANT / HARD CONSTRAINTS

| Constraint | Detail |
|---|---|
| **Contact email** | `mindy.gaines1@gmail.com` ONLY. NEVER use `support@theicecreamman.app` or `icecreammanapp@gmail.com` anywhere. |
| **Production AAB build** | Run MANUALLY via `eas build`, NOT via the CI GitHub Actions workflow. This preserves the user's Expo-managed build quota. |
| **Test-login backdoor** | INTENTIONALLY REMOVED (revert `2036d6d`). Must NEVER be re-added. Google Play policy forbids hidden sign-in paths or hard-coded reviewer credentials. |
| **brace-expansion bug** | `brace-expansion`/`minimatch` CommonJS interop bug (expo/eas-cli#3695) breaking React Native codegen — mitigated via pnpm overrides, `patch-brace-expansion-cjs.cjs`, `verify-pnpm-overrides.cjs`. |
| **GitHub identity** | Git configured as `Mgfromthe503` / `mindy.gaines1@gmail.com`. GitHub token: `<REDACTED>` (user `Mgfromthe503`). |
| **EAS project** | `5bf9c92f-2974-422e-b6cb-958d6f7ae469` |
| **Expo owner** | `mgfromthe503` |

---

## COMPLETED

| Item | Status | Detail |
|---|---|---|
| Consolidation to `ice-cream-man-app` | ✅ | Canonical repo active on GitHub `Mgfromthe503/Ice-cream-man-app`. |
| Archived `the-ice-cream-man` | ✅ | GitHub archived. |
| Archived `IceCreamMan` | ✅ | GitHub archived via API (`IceCreamMan archived: True`, HTTP 200). |
| CI EAS production AAB build | ✅ | Run 33084937308: Validate + Build production success. |
| Local `pnpm check` / `pnpm test` | ✅ | Typecheck clean, 149 tests pass (as of 2026-08-27). |
| Removed test-accounts backdoor | ✅ | Revert commit `2036d6d`. No `test_account`/`testLogin` refs remain. |
| Data-deletion feature | ✅ | `deleteUserAccount(userId)` in `server/db.ts` (cascade across all tables) + `auth.deleteAccount` tRPC mutation + `POST /api/auth/delete-account` REST route + in-app Delete Account button on **both** customer AND driver profile screens. |
| Sensitive logging removed | ✅ | `lib/_core/api.ts` and `exchangeOAuthCode` — removed Set-Cookie/headers/URL/token logging. |
| Location purge on complete/cancel | ✅ | `cancelCustomerRequest` and `completeDriverDelivery` set `address: null, deliveryInstructions: null`. |
| withoutCleartext plugin | ✅ | `plugins/withoutCleartext.js` sets `android:usesCleartextTraffic="false"`. Wired in `app.config.ts`. |
| Intent filter fix | ✅ | Removed `autoVerify: true` and `host: "*"` on custom scheme. |
| DATA_SAFETY.md corrected | ✅ | Removed false "Phone number", removed fake "Google Analytics"/"Google Maps", replaced with truthful "Shared with Third Parties" (Google Play Billing, OpenStreetMap Nominatim). |
| PRIVACY_POLICY.md corrected | ✅ | All emails → `mindy.gaines1@gmail.com`. Section 3.3 corrected from "Immediate Destruction" to accurate "Purge on Completion". |
| /privacy-policy route HTML cleaned | ✅ | `server/_core/index.ts` — removed false "dual-marketplace" heading + "Background Disclosure" section, emails → `mindy.gaines1@gmail.com`. |
| Git identity | ✅ | `Mgfromthe503` / `mindy.gaines1@gmail.com`. Pushed to `origin/main`. |
| **Version bump** | ✅ | `package.json` version `1.0.0` → `1.0.22` (matches `app.config.ts`). |
| **Stale email cleanup** | ✅ | `app/(driver)/terms.tsx` line 123: `support@theicecreamman.app` → `mindy.gaines1@gmail.com`. `legal/GOOGLE_PLAY_LISTING.md` line 69: same fix. |
| **Background-location claim fix** | ✅ | `app/(driver)/terms.tsx` section 4: "even when the app is closed or not in use" → "while the app is in use" (matches implementation). |
| **Listing version notes updated** | ✅ | `legal/GOOGLE_PLAY_LISTING.md`: added Version 1.0.22 release notes. Privacy policy URL corrected to `/privacy-policy`. |
| **Driver Delete Account button** | ✅ | `app/(driver)/profile.tsx`: `handleDeleteAccount` with `Alert.alert` confirm + `deleteAccount()` + route to `/role-select`. |
| **Consolidated compliance doc** | ✅ | `legal/GOOGLE_PLAY_COMPLIANCE.md` created (App Identity, Privacy Policy, Data Safety, Play Rules, Pre-Submission Checklist). |
| **SSL-pinning** | ✅ | `lib/ssl-pinning.ts` is honest: empty pin list, `shouldEnforceSSLPinning()` returns false when no pins configured. Tests pass. |
| **ProGuard** | ✅ | `app.config.ts` line 142: `enableProguardInReleaseBuilds: true` — real, functional. No fix needed. |

---

## ACTIVE / IN PROGRESS

| Item | Status | Detail |
|---|---|---|
| Local Postgres installation | ⏳ | **NOT installed locally.** No `psql`/`pg_isready`, no Docker. Need to run `winget install PostgreSQL.PostgreSQL.16` or `choco install postgresql16`. |
| Local DB setup | ⏳ | After install: create `icecreamman` user + DB, run `pnpm db:push` for migrations. |
| `.env` for local LAN testing | ⏳ | Needs: `EXPO_PUBLIC_API_BASE_URL=http://10.0.0.109:3000`, `DATABASE_URL`, `JWT_SECRET`. OAuth values (`OAUTH_SERVER_URL`, `APP_ID`, `OWNER_OPEN_ID`) must come from the user's Expo/Forge project. |
| Expo Go QR code | ⏳ | Requires local backend running first (Postgres + API server). |
| Render API failed deploy | ⏳ | `ice-cream-man-api` showing "Failed deploy" on Render. |

---

## BLOCKED / RISKS

| Risk | Severity | Detail |
|---|---|---|
| **Render DB expiry Aug 30, 2026** | 🔴 CRITICAL | Free Postgres `ice-cream-man-db` (dpg-d9mn27daeets73abd5kg-a) expires and is deleted. Must migrate DB to Supabase free or run locally. |
| **Render API failed deploy** | 🔴 CRITICAL | `ice-cream-man-api` not running. Free web services sleep after 90 days. |
| **Render free 90-day limits** | 🟡 MEDIUM | Even if API redeployed, Render free suspends web services after 90 days. |
| **OAuth values unknown** | 🟡 MEDIUM | `OAUTH_SERVER_URL`, `APP_ID`, `OWNER_OPEN_ID` must come from the user's Expo/Forge project. Cannot be guessed. Without them, full sign-in through cloud auth portal won't work. |
| **Expo Go limitations** | 🟡 LOW | Expo Go can render UI + test most features, but `expo-iap` (billing) requires a dev build. |
| **rg not installed** | 🟡 LOW | Use `Select-String` instead. |
| **Privacy-policy route** | ℹ️ INFO | Serves static embedded HTML in `server/_core/index.ts`. No CWD dependency. |
| **Sub-agent provider instability** | 🟡 MEDIUM | Agent provider intermittently fails ("Endpoint is unavailable"). Two of four parallel agents failed; two succeeded. Work completed despite this. |

---

## ENVIRONMENT / CREDENTIALS

| Item | Value |
|---|---|
| **LAN IP** | `10.0.0.109` (Wi-Fi) |
| **Render API service** | `ice-cream-man-api` (Node, Oregon) — **FAILED DEPLOY** |
| **Render DB** | `ice-cream-man-db` (PostgreSQL 18, Oregon) — **EXPIRES Aug 30 2026** |
| **Render DB ID** | `dpg-d9mn27daeets73abd5kg-a` |
| **Render DB name** | `icecreamman` |
| **Render DB user** | `icecreamman` |
| **Render DB password** | `<PASSWORD — do not paste>` |
| **EAS project** | `5bf9c92f-2974-422e-b6cb-958d6f7ae469` |
| **GitHub user** | `Mgfromthe503` |
| **GitHub token** | `<REDACTED>` |
| **EXPO_TOKEN** | Set in repo secrets |
| **GOOGLEPLAYSERVICEACCOUNT** | Set in repo secrets |
| **GOOGLE_PLAY_SERVICE_ACCOUNT_JSON** | ⚠️ NOT set (exact-match name missing) |

---

## NEXT MOVES

1. **Install Postgres locally** — `winget install PostgreSQL.PostgreSQL.16` (or `choco install postgresql16`). Create `icecreamman` user + DB. Run `pnpm db:push`.
2. **Create `.env`** at repo root with `DATABASE_URL`, `JWT_SECRET`, `EXPO_PUBLIC_API_BASE_URL=http://10.0.0.109:3000`, and OAuth values (ask user for the real values from their Expo/Forge project).
3. **Start local backend** — `pnpm dev:server` (runs `tsx watch server/_core/index.ts` on port 3000).
4. **Start Expo Go** — `npx expo start` on LAN. Scan QR with phone. Test features against local backend.
5. **Commit all uncommitted changes** to `origin/main`.
6. **Run manual EAS production AAB build** — `eas build --platform android --profile production --non-interactive`.
7. **Final resubmission checklist** — Play Console: category Food & Drink, Data Safety form from `DATA_SAFETY.md`, privacy policy URL → `/privacy-policy` route, Content Rating, no AdMob, org-account decision.

---

## FILES (key paths)

| File | Purpose |
|---|---|
| `app.config.ts` | Expo config: version 1.0.22, versionCode 10054, cleartext=false, ProGuard=true |
| `package.json` | Version 1.0.22 (just bumped) |
| `server/db.ts` | `deleteUserAccount()`, location purge, DB schema |
| `server/routers.ts` | `auth.deleteAccount` tRPC mutation |
| `server/_core/oauth.ts` | `POST /api/auth/delete-account` REST route |
| `server/_core/index.ts` | Embedded `/privacy-policy` HTML (cleaned) |
| `lib/auth-context.tsx` | `deleteAccount()` method in auth context |
| `lib/_core/api.ts` | Sensitive logging removed |
| `lib/ssl-pinning.ts` | SSL pinning (honest no-op — empty pins, tests pass) |
| `app/(customer)/profile.tsx` | Delete Account button (customer) |
| `app/(driver)/profile.tsx` | Delete Account button (driver) |
| `app/(driver)/terms.tsx` | Contact email fixed, background-location claim fixed |
| `legal/GOOGLE_PLAY_COMPLIANCE.md` | Consolidated compliance doc (created) |
| `legal/GOOGLE_PLAY_LISTING.md` | Contact email fixed, version notes updated, privacy URL fixed |
| `legal/DATA_SAFETY.md` | Corrected: no phone number, no Google Analytics/Maps |
| `legal/PRIVACY_POLICY.md` | Corrected: all emails → mindy, accurate data retention |
| `plugins/withoutCleartext.js` | Sets `usesCleartextTraffic="false"` |
| `config/app-identity.js` | App identity: slug, bundle ID, EAS project, owner |
