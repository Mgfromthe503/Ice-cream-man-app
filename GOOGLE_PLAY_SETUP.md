# Google Play Setup (The Ice Cream Man)

This guide covers the required Google Play setup for production release builds from:
`Mgfromthe503/Ice-cream-man-app`.

## 1) Required app identity (must match Play + Expo)

- App name: `The Ice Cream Man`
- Android package: `com.icecreamman.app`
- Expo slug: `the-ice-cream-man-app`
- Expo owner: `mgfromthe503`
- EAS project ID: `5bf9c92f-2974-422e-b6cb-958d6f7ae469`

If any value differs between Play Console and Expo/EAS config, release and update flows can fail.

## 2) Play Console requirements

1. Create/select app with package `com.icecreamman.app`.
2. Complete Store listing, App content, Data safety, and Privacy policy URL.
3. Create and activate in-app product:
   - Product ID: `icm_vendor_registration`
   - Type: one-time (managed, non-consumable)
   - Price: `$25.00`
4. Add at least one tester to Internal testing.

## 3) GitHub secrets for automated build/submit

Set repository secrets:

- `EXPO_TOKEN` (required for EAS build)
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (required for automated submit)

Do not commit keystore files or service account JSON to the repository.

## 4) Triggering builds

Preferred workflow:

1. GitHub Actions → **EAS Build and Submit**.
2. Run workflow on `main`.
3. Choose `production` profile.
4. Set `submit=true` only when Play service account secret is configured.

Local fallback:

```bash
eas build --platform android --profile production
eas submit --platform android --profile production --latest
```

## 5) When builds keep failing

1. Ensure validation passes in CI (`pnpm check`, `pnpm test`).
2. Ensure lockfile is current after dependency override changes (`pnpm install` and commit `pnpm-lock.yaml`).
3. Re-run with `--clear-cache`.
4. Inspect Expo `Run gradlew` logs from the EAS build link for the root Gradle error.

For full runbook and release checklist, use `/home/runner/work/Ice-cream-man-app/Ice-cream-man-app/LAUNCH.md`.
