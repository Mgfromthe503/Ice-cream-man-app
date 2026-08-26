# Google Play Setup Reference

This reference lists the configuration that must exist before the repository can submit a production Android build to Google Play. Use the [Android and Google Play release runbook](android-google-play.md) for the release procedure itself.

## Confirm the registered application identity

The Play app, Expo project, and checked-in configuration must describe the same application. Do not edit these values in this document; verify them in the source files below.

| Value | Source of truth |
|---|---|
| App name, Android package, Expo slug, owner, and EAS project identifier | [`config/app-identity.js`](../../config/app-identity.js) |
| User-visible version and Android native configuration | [`app.config.ts`](../../app.config.ts) |
| Build profiles and Play track configuration | [`eas.json`](../../eas.json) |

## Configure Google Play Console

Before an automated or local Play submission, an authorized account holder must create or select the Play app that uses the registered Android package. Complete the store information required for the intended release and keep each declaration aligned with the distributed app.

| Console area | Repository reference |
|---|---|
| Store listing | [Google Play listing content](../../legal/GOOGLE_PLAY_LISTING.md) |
| Privacy policy | [Privacy Policy](../../legal/PRIVACY_POLICY.md); host it at a publicly accessible URL before entering it in Play Console. |
| Data Safety | [Data Safety reference](../../legal/DATA_SAFETY.md) |
| App access and reviewer instructions | [Google Play app access](../../legal/GOOGLE_PLAY_APP_ACCESS.md) |
| Release notes | The release-note material in [Google Play listing content](../../legal/GOOGLE_PLAY_LISTING.md), adapted to the actual release. |

The app's internal testing track should have an appropriate tester group before a release candidate is submitted. Verify that the reviewer and tester flows described in the app-access material still work in the build being released.

## Configure driver registration billing

The driver registration flow expects the one-time product identifier configured by the application. Confirm the product is active in Play Console and that its identifier matches the application configuration before testing the billing flow.

| Check | Expected state |
|---|---|
| Product identifier | Matches the identifier used by the application. |
| Product type | A one-time product suitable for the registration flow. |
| Availability | Active for the test or release track being used. |
| Test path | Exercised by a permitted Play test account before production promotion. |

The app grants vendor access only after its backend verifies the opaque purchase token with the Google Play Developer API, acknowledges an unacknowledged one-time purchase, and persists a one-time token hash. Before internal testing, enable the Android Publisher API for the same Google Cloud project and grant the service account access to this Play app. Set `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` only in the backend's approved secret manager; it must contain the service-account JSON and must never be added to source control, EAS public variables, app configuration, or a client bundle.

> The GitHub Actions submission secret is separate from the running backend configuration. Both may use appropriately scoped service accounts, but the backend must have its own managed secret before vendor registration is enabled.

## Configure automated submission

Automated submission is optional. The manual workflows can create EAS builds with only the Expo token, but submission requires a Google Play service-account JSON secret.

1. Create or select a service account that has the required access to the target Play application.
2. Generate the service-account JSON through the approved Google Cloud and Play Console process.
3. Add its full JSON contents as the GitHub Actions repository secret `GOOGLEPLAYSERVICEACCOUNT`. The workflow also accepts `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` and `GOOGLE_SERVICE_ACCOUNT_KEY` for compatibility.
4. Add an Expo access token for the owning Expo account as the repository secret `EXPO_TOKEN`. The workflow also accepts `EXPOTOKEN` for compatibility.
5. Use **EAS Build and Submit** with the `production` profile and `submit=true` when ready.

Never commit service-account JSON or Android signing material to the repository. The workflow writes the service-account JSON to a permission-restricted temporary file, removes it at the end of the job, and uses it only for the requested submission and R8 mapping upload.

## Verify billing and deobfuscation configuration

Before manually dispatching an Android production build, run:

```bash
pnpm verify:android-release
pnpm verify:play-signing
```

The Android preflight verifies the explicit Google Play Billing Library `8.1.0`
dependency, matching Billing KTX dependency, `com.android.vending.BILLING`
permission, R8 minification/resource shrinking, production AAB configuration,
remote version-code incrementing, and retention of `mapping.txt` as an EAS
build artifact. The signing preflight compares only public EAS certificate
metadata with the upload-certificate SHA-1 recorded in
`config/google-play-signing.json`; it does not download a keystore or read a
private credential. CI runs the signing check immediately before `eas build`.

The production profile creates an Android App Bundle, not an APK. When
`submit=true`, the workflow submits the exact completed EAS build, downloads
its retained `mapping.txt` artifact, and attaches that mapping to the matching
Google Play version code through the Android Publisher API. See [Google Play's
deobfuscation API reference](https://developers.google.com/android-publisher/api-ref/rest/v3/edits.deobfuscationfiles/upload).

> Play Console evaluates the uploaded artifact, not the source repository.
> Do not reuse the rejected version-code `10020` bundle. After this
> configuration is on `main`, create a new production AAB so EAS assigns a new
> Android version code.

If a newly submitted production bundle still shows the mapping warning, inspect
the EAS **build artifacts** archive for
`android/app/build/outputs/mapping/release/mapping.txt` and review the mapping
upload step in the release workflow. Do not substitute a manually created or
stale mapping file for the new EAS production artifact.

## Verify setup before a release

| Verification | Where to check |
|---|---|
| Identity and package alignment | `config/app-identity.js`, `app.config.ts`, Expo project, and Play Console app |
| EAS credentials and ownership | EAS account and credential management for the configured project |
| Required GitHub Actions secrets | Repository Actions secrets settings |
| Store declarations and reviewer flow | Play Console and the linked `legal/` materials |
| Backend purchase verification | A Google Play test purchase produces a server-verified entitlement without storing the raw token |
| Automated submission permissions | A controlled production-profile test or an authorized account review |

## Related documentation

| Topic | Document |
|---|---|
| Release procedure | [Android and Google Play release runbook](android-google-play.md) |
| Android build failures | [Android and EAS troubleshooting](../troubleshooting/android-eas-builds.md) |
| Store and compliance materials | [Legal directory](../../legal/) |
| Documentation navigation | [Documentation index](../README.md) |
