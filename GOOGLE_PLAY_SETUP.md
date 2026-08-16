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

## 5) Billing Library and deobfuscation preflight

Before submitting an Android production build, run:

```bash
pnpm verify:android-release
```

The preflight verifies that the generated Android project will use the explicit
Google Play Billing Library `8.1.0` dependency (well above the `6.0.1` minimum
reported by Play Console), retains `com.android.vending.BILLING`, and enables
R8 minification and resource shrinking for release builds. The same command is
run in the repository validation workflow before a manual EAS build can start.

The production profile creates an Android App Bundle, not an APK. Because the
project uses Android Gradle Plugin through Expo's current Android tooling and
R8 is enabled, the generated AAB contains its `mapping.txt` deobfuscation file;
Google Play automatically reads it from app bundles built with Android Gradle
Plugin 4.1 or later. See [Google Play's deobfuscation guidance](https://support.google.com/googleplay/android-developer/answer/9848633?hl=en).

> Play Console evaluates the uploaded artifact, not this repository's source.
> Do not reuse the rejected version-code `10020` bundle. Trigger a new
> production AAB build after this configuration is on `main`; EAS will assign a
> new version code because `eas.json` enables `autoIncrement`.

If a newly downloaded production AAB still shows the mapping warning, inspect
it before upload:

```bash
unzip -l path/to/app.aab | grep 'BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map'
```

If that file is absent, stop the release and inspect the EAS **Run gradlew**
logs. Do not upload a manually created or stale AAB in place of the new EAS
production artifact.

## 6) When builds keep failing

1. Ensure validation passes in CI (`pnpm check`, `pnpm test`).
2. Ensure lockfile is current after dependency override changes (`pnpm install` and commit `pnpm-lock.yaml`).
3. Re-run with `--clear-cache`.
4. Inspect Expo `Run gradlew` logs from the EAS build link for the root Gradle error.

For full runbook and release checklist, use `/home/runner/work/Ice-cream-man-app/Ice-cream-man-app/LAUNCH.md`.
