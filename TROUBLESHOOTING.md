# Ice Cream Man Build Troubleshooting

## Canonical source repository

Use **`Mgfromthe503/Ice-cream-man-app`** as the single source repository for Expo/EAS builds.

Do not build from forks or mirrored repositories unless you intentionally re-link the Expo project and credentials.

## Canonical identity values (must always match)

Source of truth: `/home/runner/work/Ice-cream-man-app/Ice-cream-man-app/config/app-identity.js`

- App name: `The Ice Cream Man`
- Expo slug: `the-ice-cream-man-app`
- Bundle ID / Android package: `com.icecreamman.app`
- Deep-link scheme: `icecreamman`
- Expo owner: `mgfromthe503`
- EAS project ID: `5bf9c92f-2974-422e-b6cb-958d6f7ae469`

These values must stay consistent across:

- `config/app-identity.js`
- `app.config.ts`
- EAS project selected by your Expo token/account

## Repeated EAS Android failure loop: diagnostic flow

1. Confirm your workflow run used this repository and branch.
2. Confirm `EXPO_TOKEN` authenticates as `mgfromthe503`.
3. Confirm build profile is `production` unless you intentionally chose another profile.
4. Confirm dependency guards pass:
   - `pnpm verify:deps`
   - `pnpm test`
5. Confirm `brace-expansion` resolves to `2.0.2` (required for Gradle codegen interop).
6. Re-run EAS with a clean worker cache:
   - `eas build -p android --profile production --clear-cache`

## Common CI/EAS outcomes

### Validate job fails before EAS build starts

If GitHub Actions fails in `Run tests` or `Validate types`, EAS build is skipped. Fix validation first, then re-run.

### EAS build fails with codegen / brace-expansion error

This repository hard-pins `brace-expansion` to `2.0.2` and includes preload/patch guards. If this regresses, regenerate lockfile and commit it:

```bash
pnpm install
git add package.json pnpm-lock.yaml
git commit -m "fix: restore brace-expansion 2.0.2 pin for EAS codegen"
```

### EAS build fails with Gradle unknown error

Open the Expo build page from workflow logs and inspect the **Run gradlew** phase. GitHub logs only show the high-level EAS failure summary.

## Build workflow behavior

- `.github/workflows/eas-build-submit.yml`
  - PR/push to `main`: validate only (types/tests)
  - manual `workflow_dispatch`: validate + optional EAS build/submit
- `.github/workflows/eas-build.yml`
  - manual EAS build workflow

EAS minutes are only consumed on manual workflow dispatch.
