# Clean Launch Track

This branch is an isolated launch candidate. It does not reuse the existing Google Play application or its EAS project.

## Canonical identity

- App name: `The Ice Cream Man`
- Android/iOS package: `com.icecreamman.launch`
- Expo slug: `the-ice-cream-man-launch`
- Deep-link scheme: `icecreamman-launch`
- Expo owner: `mgfromthe503`
- Version: `1.0.0`
- Android output: AAB
- EAS profile: `production`

## Intentionally not reused

- Existing package: `com.icecreamman.app`
- Existing EAS project: `5bf9c92f-2974-422e-b6cb-958d6f7ae469`
- Existing upload certificate: `89:61:BC:40:53:C1:21:FF:A4:1F:58:46:98:A5:C5:11:4B:9B:2E:BF`
- Existing EAS upload credential: `BE:D6:3F:D3:DA:34:F1:EF:18:19:68:F9:B0:E0:35:E3:23:1B:E5:7C`

## Fresh EAS project

This source deliberately leaves the EAS project ID unset. A new EAS project must be created and its ID supplied as `EAS_PROJECT_ID` for CI. Expo's documented flow is `eas init`, which creates a project and generates a unique project ID. See the current Expo EAS CLI documentation.

## Fresh Android signing

The new EAS project must use a new Android upload keystore. EAS can generate and securely store a new keystore when no remote keystore exists.

Do not put the keystore or credentials in GitHub source control.

## Release invariant

Before creating the first Google Play submission, verify:

`EAS upload certificate SHA-1 == AAB signing certificate SHA-1 == Google Play upload certificate SHA-1`

The existing production app remains untouched while this track is evaluated.
