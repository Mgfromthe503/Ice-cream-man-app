# Cleanup & Launch-Readiness Audit — The Ice Cream Man App

## Original fix (done)

- [x] Fix `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` (pnpm-workspace.yaml overrides + regen lockfile)
- [x] PR #57 opened against main

## Dependency / SDK alignment (done)

- [x] Fix 8 packages flagged by `expo install --check` to SDK 54 expected versions
- [x] Remove ignored top-level `overrides` + `pnpm.overrides` from package.json
- [x] Move pnpm-only settings out of `.npmrc` into `pnpm-workspace.yaml`
- [x] Regenerate `pnpm-lock.yaml`

## Identity / rename cleanup

- [x] Verify slug/scheme/bundle-id/project-id consistency (config/app-identity.js, app.config.ts, tests, docs)
- [x] Replace stale `react-native-iap` references with `expo-iap` (README, docs, app.config.ts if present)
- [x] Fix `lib/billing.ts` Billing Library version comment (7.0.0 → 9.1.0)

## Verification

- [x] `pnpm install --frozen-lockfile` passes
- [x] `npx expo install --check` clean
- [x] `pnpm check` (tsc) clean
- [x] `pnpm test` (vitest) passes
- [x] `npx expo-doctor` clean

## Git

- [x] Commit + push to `blackboxai/fix-lockfile-config-mismatch`
- [x] Update PR #57
