# Triage: EAS Android Gradle codegen failure (`brace-expansion` / minimatch)

## Symptom

EAS Android production build fails during:

```text
:react-native-gesture-handler:generateCodegenSchemaFromJavaScript
Process 'command 'node'' finished with non-zero exit value 1
```

Underlying JS error:

```text
TypeError: (0 , brace_expansion_1.default) is not a function
```

Also seen in EAS auto-fingerprint (mitigated with `EAS_SKIP_AUTO_FINGERPRINT=1`).

**Tracked builds:** `4b4c43bd`, `8a526540`, `58d67abe`, `17f687ba`, `e4f8dab3` (Android / production / STORE / SDK 54.0.34).

## Root cause (confirmed)

| Package | Behavior |
|---------|----------|
| `minimatch@9.x` | CJS build uses `__importDefault(require("brace-expansion")).default(...)` |
| `brace-expansion@5.0.5` (and 5.0.6+) | CJS build sets `__esModule: true` and **only** `exports.expand = expand` — **no** `exports.default` |
| `brace-expansion@2.1.3` | Security-patched 2.x pin used in this repo; preload/postinstall interop shim guarantees callable `.default` for minimatch/codegen |

TypeScript `__importDefault` returns the module unchanged when `__esModule` is true, so `.default` is `undefined` on 5.x.

**Why PR #56 still failed on `e4f8dab3`:** `package.json` pin changes were made, but **`pnpm-lock.yaml` was never regenerated**. EAS resolved a stale graph. Postinstall patches only cover the install-phase tree; Gradle's node process can still resolve a nested broken copy.

Documented upstream: [expo/eas-cli#3695](https://github.com/expo/eas-cli/issues/3695).

## Fix layers (defense-in-depth)

1. **NODE_OPTIONS preload (primary for Gradle)** — `scripts/brace-expansion-preload.cjs`  
   Loaded on every node process via `eas.json` base env:  
   `NODE_OPTIONS=--require ./scripts/brace-expansion-preload.cjs`  
   Hooks `Module._load` so `require('brace-expansion')` always has a callable `.default`, including Gradle-spawned codegen.

2. **Absolute + selective override** — `brace-expansion: 2.1.3`  
   - Top-level `overrides` and `pnpm.overrides`  
   - Range selectors `brace-expansion@>=2.1.0 <3` and `brace-expansion@>=5` forced to `2.1.3`  
   - Direct dependency `brace-expansion@2.1.3`  
   - **Must regenerate `pnpm-lock.yaml` after changing overrides** (`pnpm install`, commit lockfile).

3. **Interop patch (secondary)** — `scripts/patch-brace-expansion-cjs.cjs` on postinstall / eas-build-post-install.

4. **Pre/post guard** — `scripts/ensure-brace-expansion.cjs`.

5. **Hoist** — `.npmrc` `public-hoist-pattern` for `brace-expansion` / `minimatch` + `node-linker=hoisted` + `shamefully-hoist=true`.

6. **EAS profile** — `EAS_SKIP_AUTO_FINGERPRINT=1` on the base profile.

7. **CI** — EAS Build is **manual-only** (`workflow_dispatch`).

## Required one-time lockfile fix (local)

```bash
rm -rf node_modules
pnpm install
git add pnpm-lock.yaml package.json
git commit -m "chore: regen pnpm-lock.yaml for brace-expansion@2.1.3"
git push
```

Then:

```bash
eas build -p android --profile production --clear-cache
```

## Where overrides must live (pnpm 9 vs 10)

`pnpm` reads `overrides` from `pnpm-workspace.yaml` only from **v10** onwards. This repo builds on **pnpm 9.12.0** (`package.json` `packageManager` and `eas.json` `build.base.pnpm`), where that key is parsed as unknown config and **silently ignored**.

Verified locally with pnpm 9.12.0 — overrides declared only in `pnpm-workspace.yaml`:

```text
pnpm-lock.yaml                  no `overrides:` section emitted
node_modules/brace-expansion    5.0.8   (expected 2.1.3)
```

All 20 pins — the `brace-expansion` codegen fix plus the security overrides (`axios`, `form-data`, `tar`, `node-forge`, `postcss`, …) — stop applying. Keep overrides in `package.json` `pnpm.overrides` until `packageManager` **and** `eas.json` both move to pnpm 10.

## Guard: `pnpm verify:deps`

`scripts/verify-pnpm-overrides.cjs` fails the build when:

1. `pnpm-workspace.yaml` declares `overrides` while `packageManager` is pnpm < 10;
2. the `overrides` block in `pnpm-lock.yaml` differs from `package.json` `pnpm.overrides` — the exact condition behind `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`, normally caused by editing overrides without regenerating the lockfile;
3. `brace-expansion` is pinned to, or resolves to, anything other than `2.1.3`.

It runs in CI before install, again after install, and on the EAS worker via `eas-build-pre-install`, so drift fails fast instead of burning an Expo build. CI installs with `--frozen-lockfile` for the same reason.

## Exit criteria (when to remove pins / shim)

Remove the preload, override, and scripts when **all** of the following are true:

- `@react-native/codegen` / `minimatch` consume brace-expansion via named ESM import, **or**
- `brace-expansion` ships `exports.default` on its CJS build for every major line in the tree, **and**
- A clean EAS production Android build succeeds with the override and preload disabled.

## Local verification

```bash
pnpm install
NODE_OPTIONS='--require ./scripts/brace-expansion-preload.cjs' node -e "
  const be = require('brace-expansion');
  const i = be && be.__esModule ? be : { default: be };
  console.log(typeof i.default, i.default('{a,b}'));
"
```

Expected: `function [ 'a', 'b' ]`

In Gradle logs, confirm codegen tasks complete without `(0 , brace_expansion_1.default) is not a function`.
