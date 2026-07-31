# 🍦 Launch Today — The Ice Cream Man

> **Same-day execution guide** for a successful Google Play launch from this repo.
> Work through each section in order. Most steps take < 5 minutes each.

---

## 1. App Identity Reference

| Key | Value |
|-----|-------|
| App name | `The Ice Cream Man` |
| Expo slug | `the-ice-cream-man-app` |
| Bundle / package ID | `com.icecreamman.app` |
| Deep-link scheme | `icecreamman` |
| EAS project ID | `5bf9c92f-2974-422e-b6cb-958d6f7ae469` |
| Expo owner | `mgfromthe503` |
| App version | `1.0.14` |
| Android `versionCode` | auto-increments on each production EAS build |
| Play submit track | `internal` (draft) — promote to production in Play Console |

Source of truth: `config/app-identity.js` and `app.config.ts`.

---

## 2. Prerequisites Checklist

Before triggering any build, confirm each item below:

### Expo / EAS
- [ ] You have an [Expo account](https://expo.dev) as `mgfromthe503`
- [ ] Project is linked: `eas init --account mgfromthe503 --non-interactive`
  (only needed once — project ID `5bf9c92f-2974-422e-b6cb-958d6f7ae469` is already in `config/app-identity.js`)
- [ ] EAS Android keystore is managed: run `eas credentials` to confirm or generate
- [ ] Create an Expo access token at <https://expo.dev/settings/access-tokens> and add it as GitHub secret `EXPO_TOKEN`

### Google Play Console
- [ ] Google Play Developer account active (one-time $25 fee paid to Google)
- [ ] App created in Play Console with package `com.icecreamman.app`
- [ ] In-app product `icm_vendor_registration` created ($25 one-time, active)
- [ ] Privacy policy hosted at a public URL (see §6 below) and entered in **App content → Privacy policy**
- [ ] Data Safety form filled (see `legal/DATA_SAFETY.md`)
- [ ] App content rating questionnaire completed
- [ ] Store listing filled from `legal/GOOGLE_PLAY_LISTING.md`
- [ ] App access instructions entered from `legal/GOOGLE_PLAY_APP_ACCESS.md`
- [ ] At least one tester added to Internal Testing track (your own Google account works)

### Service Account (for automated submit)
- [ ] Service account created in Google Cloud Console with `releasemanager` role on the Play Developer API
- [ ] JSON key downloaded and added as GitHub secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

> **If you skip the service account**, you can still submit manually via `eas submit` locally (see §4b).

---

## 3. Required GitHub Secrets

Add at: **GitHub → Repo Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Where to create | Required for |
|-------------|-----------------|--------------|
| `EXPO_TOKEN` | <https://expo.dev/settings/access-tokens> | EAS build |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Cloud Console → Service Accounts → JSON key | Automated Play submit |

> Android signing is fully EAS-managed. **Do not commit** keystores, `.jks`, `.p12`, or service-account JSON files.

---

## 4. Build & Submit Commands

### 4a. Via GitHub Actions (recommended for production)

1. Go to **Actions → EAS Build and Submit → Run workflow**
2. Select branch: `main`
3. Profile: `production`
4. Submit: `true` (requires `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret)
5. Click **Run workflow**

The workflow will:
- Run `pnpm check` (TypeScript) and `pnpm test` (Vitest)
- Build an AAB via `eas build --platform android --profile production --non-interactive --wait`
- Submit to Play internal track via `eas submit --platform android --latest --non-interactive`

### 4b. Local build + submit (manual fallback)

```bash
# Install EAS CLI
npm install -g eas-cli

# Authenticate
eas login          # log in as mgfromthe503
# or: EXPO_TOKEN=<your_token> npx eas-cli whoami

# Build the AAB (uploaded to EAS servers, not stored locally)
eas build --platform android --profile production

# Submit the most recent production build to Play internal track
eas submit --platform android --profile production --latest

# — OR — submit a specific build by URL/ID shown in the EAS dashboard:
# eas submit --platform android --url <build-url>
```

> **Note:** `eas submit` reads the submit profile from `eas.json` (`track: "internal"`, `releaseStatus: "draft"`).
> After submission you must **promote** the release to production in Play Console manually.

---

## 5. CI / Branch Protection Settings

### Workflow gates (current setup)
| Event | Validate job (types + tests) | EAS build job |
|-------|------------------------------|---------------|
| PR → `main` | ✅ runs | ❌ skipped |
| Push → `main` | ✅ runs | ❌ skipped |
| `workflow_dispatch` | ✅ runs | ✅ runs (if `EXPO_TOKEN` set) |

EAS builds are **manual-only** (`workflow_dispatch`) so push/PR CI always stays green.

### Recommended branch protection for `main`
- Required status check: **`Validate (install + type-check + tests)`** only
- Do **not** require the `EAS Android build` job — it only runs on manual dispatch

---

## 6. Privacy Policy Hosting

The privacy policy in `legal/PRIVACY_POLICY.md` must be accessible at a public URL.

**Fastest option — GitHub Pages:**
1. Go to **Repo Settings → Pages**
2. Source: deploy from `main` branch, `/` (root)
3. After a few minutes the policy is live at:
   `https://mgfromthe503.github.io/Ice-cream-man-app/legal/PRIVACY_POLICY`
   (or rename the file to `privacy-policy.md` / host it at your custom domain)
4. Enter this URL in Play Console under **App content → Privacy policy**

---

## 7. After Build & Submit — Play Console Promotion Steps

> These are **manual Play Console clicks** — outside repo control.

1. **Play Console → Testing → Internal testing** — confirm the build is listed
2. Tap the build → **Promote to production** (or keep in internal/closed testing first)
3. Set rollout percentage (start with 20% if cautious, or 100%)
4. Add release notes (copy from `legal/GOOGLE_PLAY_LISTING.md` → "What's New")
5. Submit for review

Google typically reviews within **1–3 business days** for new apps.

---

## 8. In-App Product Setup (required for $25 driver registration)

> **Without this step, drivers cannot register.** Do this before promoting to production.

1. Play Console → **Your app → Monetize → In-app products**
2. Click **Create product**
3. Product ID: `icm_vendor_registration`  ← must match exactly
4. Product type: **One-time** (managed, non-consumable)
5. Price: **$25.00** (USD; add other currencies as needed)
6. Status: **Active**
7. Save

---

## 9. Pre-Flight Final Checklist

- [ ] `pnpm check` passes (TypeScript — no errors)
- [ ] `pnpm test` passes (all 152 tests green)
- [ ] `config/app-identity.js` — EAS project ID matches Expo dashboard
- [ ] `eas.json` `cli.version` ≥ 16.0.0 ✅
- [ ] `android.versionCode` in `app.config.ts` is higher than last submitted build (auto-increment enabled ✅)
- [ ] `app.config.ts` `version` string updated if shipping a new user-visible version
- [ ] Privacy policy URL entered in Play Console and publicly reachable
- [ ] In-app product `icm_vendor_registration` is **Active** in Play Console
- [ ] `EXPO_TOKEN` secret set in GitHub
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret set in GitHub (for CI submit)
- [ ] Test accounts documented in `legal/GOOGLE_PLAY_APP_ACCESS.md` actually work in the build
- [ ] Store listing screenshots uploaded (Play Console requires at least 2 phone screenshots)

---

## 10. Known Non-Blocking Items

| Item | Status | Action needed |
|------|--------|---------------|
| CI quota errors (e.g. run 30434222793) | Non-blocking — Copilot agent quota, not app code | None |
| SSL certificate pinning | Disabled (safe default — no production API host yet) | Add pins when backend domain is finalized |
| Backend API (`EXPO_PUBLIC_API_BASE_URL`) | Runtime env var — not required for app to launch | Set in EAS environment variables for production |
| Google Analytics SDK | Not integrated — do not declare in Data Safety form | N/A |
| Push notifications (FCM) | Wired via expo-notifications; FCM project required for real delivery | Configure in Firebase + Expo push credentials |

---

## 11. Audit Summary

### Blockers fixed in this PR
| Fix | File |
|-----|------|
| Deep-link scheme `manusapp` → `icecreamman` in README | `README.md` |
| Removed retired Manus sandbox privacy-policy URL | `legal/GOOGLE_PLAY_APP_ACCESS.md` |
| Removed incorrect Google AdMob data-sharing declaration | `legal/DATA_SAFETY.md` |
| Created this launch runbook | `LAUNCH.md` |

### External / manual items (not repo-fixable)
- Google Play Developer account registration
- Play Console app creation + store listing entry
- Privacy policy public hosting
- In-app product creation in Play Console
- EAS keystore generation (first-time only; `eas credentials`)
- GitHub secrets (`EXPO_TOKEN`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`)
- Play Console release promotion after EAS submit
