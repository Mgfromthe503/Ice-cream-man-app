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

## Configure automated submission

Automated submission is optional. The manual workflows can create EAS builds with only the Expo token, but submission requires a Google Play service-account JSON secret.

1. Create or select a service account that has the required access to the target Play application.
2. Generate the service-account JSON through the approved Google Cloud and Play Console process.
3. Add its full JSON contents as the GitHub Actions repository secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`.
4. Add an Expo access token for the owning Expo account as the repository secret `EXPO_TOKEN`.
5. Use **EAS Build and Submit** with the `production` profile and `submit=true` when ready.

The current workflows accept `GOOGLE_SERVICE_ACCOUNT_KEY` as a legacy fallback, but new configuration should use `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`. Never commit service-account JSON or Android signing material to the repository.

## Verify setup before a release

| Verification | Where to check |
|---|---|
| Identity and package alignment | `config/app-identity.js`, `app.config.ts`, Expo project, and Play Console app |
| EAS credentials and ownership | EAS account and credential management for the configured project |
| Required GitHub Actions secrets | Repository Actions secrets settings |
| Store declarations and reviewer flow | Play Console and the linked `legal/` materials |
| Automated submission permissions | A controlled production-profile test or an authorized account review |

## Related documentation

| Topic | Document |
|---|---|
| Release procedure | [Android and Google Play release runbook](android-google-play.md) |
| Android build failures | [Android and EAS troubleshooting](../troubleshooting/android-eas-builds.md) |
| Store and compliance materials | [Legal directory](../../legal/) |
| Documentation navigation | [Documentation index](../README.md) |
