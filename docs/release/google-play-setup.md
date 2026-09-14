# Google Play Setup Reference

This reference lists the configuration that must exist before the repository can submit a production Android build to Google Play. Use the [Android and Google Play release runbook](android-google-play.md) for the release procedure itself.

## Current production release candidate

The following build is a completed, store-distribution Android App Bundle. It was built from the merged production source and is ready for an account owner to upload to **Internal testing** in Play Console. It has **not** been submitted to, reviewed by, or published on Google Play.

| Field | Verified value |
|---|---|
| EAS build | [`c7349b99-e900-46af-9765-8dc255709905`](https://expo.dev/accounts/mgfromthe503/projects/the-ice-cream-man-app/builds/c7349b99-e900-46af-9765-8dc255709905) |
| Downloadable AAB | [Production AAB, version code 10056](https://expo.dev/artifacts/eas/0epYOA2SuU8XHfj8Dz3KNHnSCdfW5Bn9hM0alkDQllk.aab) |
| Application ID | `com.icecreamman.app` |
| User-visible version | `1.0.22` |
| Android version code | `10056` |
| Source revision | `ebb9a221ed7b9ad27ffe23fa3564be34b4731650` |
| Distribution | Store (`production` profile) |

### Owner upload sequence

1. Download the AAB above and retain the EAS build link as release evidence.
2. In Play Console, open **The Ice Cream Man** app (`com.icecreamman.app`) and select **Testing → Internal testing**.
3. Create a new internal-testing release, upload the AAB, and let Play process the artifact before changing any declaration answers.
4. Confirm the uploaded artifact reports version code `10056`. Do not reuse the rejected version-code `10020` artifact.
5. Re-check the exact Policy status cards, including the organization-account enforcement and foreground-service card. The fresh build removes unused foreground-service declarations; if a card persists, use its issue details and appeal/review path rather than guessing at a declaration.
6. Reconcile App content, Data safety, Target audience and content, Privacy policy, App access, content rating, store listing, and in-app purchase declarations with this released build and the linked `legal/` materials.
7. Complete an internal-track billing test using an authorized tester. Do not promote the release until the tested customer, driver registration, parent-aware request, and privacy-sharing flows match the declarations.
8. After internal testing and Console review are clean, create the **Production** release from the same approved artifact, review the final publishing summary, and have the account owner submit it to Google for review.

> Only the account owner can upload an AAB, save Play Console declarations, create a production release, or submit it to Google. This repository guide does not perform those Console actions.

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
| Play Console content declarations | [Play Console content declarations](../../legal/PLAY_CONSOLE_CONTENT_DECLARATIONS.md). The account owner must save these accurate answers in Play Console; source-code changes alone cannot modify a Play Console declaration. |
| Child safety and parent guidance | [Child Safety and Parent Guidance](../../legal/CHILD_SAFETY_AND_PARENT_GUIDANCE.md). Verify the released request flow, target-audience selection, privacy policy, Data safety declaration, and reviewer path remain consistent. This safety acknowledgment is not age verification or verifiable parental consent. |
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
3. Add its full JSON contents as the GitHub Actions repository secret `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`.
4. Add an Expo access token for the owning Expo account as the repository secret `EXPO_TOKEN`.
5. Use **EAS Build and Submit** with the `production` profile and `submit=true` when ready.

The current workflows accept `GOOGLE_SERVICE_ACCOUNT_KEY` as a legacy fallback, but new configuration should use `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`. Never commit service-account JSON or Android signing material to the repository.

## Verify billing and deobfuscation configuration

Before submitting an Android production build, run:

```bash
pnpm verify:android-release
```

The preflight verifies that the repository is configured to generate an Android
project with the explicit Google Play Billing Library `8.1.0` dependency,
matching Billing KTX dependency, `com.android.vending.BILLING` permission, and
R8 minification and resource shrinking enabled for release builds. Both manual
EAS workflows execute this check before starting a cloud build.

The production profile creates an Android App Bundle, not an APK. With Android
Gradle Plugin 4.1 or later, Google Play automatically reads the R8
`mapping.txt` file stored in the bundle. See [Google Play's deobfuscation
guidance](https://support.google.com/googleplay/android-developer/answer/9848633?hl=en).

> Play Console evaluates the uploaded artifact, not the source repository.
> Do not reuse the rejected version-code `10020` bundle. After this
> configuration is on `main`, create a new production AAB so EAS assigns a new
> Android version code.

If a newly downloaded production AAB still shows the mapping warning, inspect
it before upload:

```bash
unzip -l path/to/app.aab | grep 'BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map'
```

If the file is absent, stop the release and inspect the EAS **Run gradlew**
logs. Do not substitute a manually created or stale AAB for the new EAS
production artifact.

## Verify setup before a release

| Verification | Where to check |
|---|---|
| Identity and package alignment | `config/app-identity.js`, `app.config.ts`, Expo project, and Play Console app |
| EAS credentials and ownership | EAS account and credential management for the configured project |
| Required GitHub Actions secrets | Repository Actions secrets settings |
| Store declarations and reviewer flow | Play Console and the linked `legal/` materials. Confirm each declaration accurately reflects the released app; do not change a declaration merely to clear a rejection. For an organization-account enforcement, preserve the complete Policy status issue details and follow [the investigation guide](../../legal/PLAY_CONSOLE_CONTENT_DECLARATIONS.md). |
| Backend purchase verification | A Google Play test purchase produces a server-verified entitlement without storing the raw token |
| Automated submission permissions | A controlled production-profile test or an authorized account review |

## Related documentation

| Topic | Document |
|---|---|
| Release procedure | [Android and Google Play release runbook](android-google-play.md) |
| Android build failures | [Android and EAS troubleshooting](../troubleshooting/android-eas-builds.md) |
| Store and compliance materials | [Legal directory](../../legal/) |
| Documentation navigation | [Documentation index](../README.md) |
