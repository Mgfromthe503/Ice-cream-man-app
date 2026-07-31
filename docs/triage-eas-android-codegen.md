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

**Tracked builds:** `4b4c43bd`, `8a526540`, `58d67abe`, `17f687ba` (Android / production / STORE / SDK 54.0.34).

## Root cause (confirmed)

| Package | Behavior |
|---------|----------|
| `minimatch@9.x` | CJS build uses `__importDefault(require("brace-expansion")).default(...)` |
| `brace-expansion@5.0.5` (and 5.0.6+) | CJS build sets `__esModule: true` and **only** `exports.expand = expand` — **no** `exports.default` |
| `brace-expansion@2.0.2` | Pure CJS: `module.exports = expand` (no `__esModule`) → `__importDefault` wraps as `{ default: fn }` |

TypeScript `__importDefault` returns the module unchanged when `__esModule` is true, so `.default` is `undefined` on 5.x.

Pinning to 5.0.5 alone is **not** sufficient. The reliable fix is to pin the entire tree to the last pure-CJS release **2.0.2**.

Documented upstream: [expo/eas-cli#3695](https://github.com/expo/eas-cli/issues/3695).

## Fix layers (defense-in-depth)

1. **Absolute + selective override (primary)** — `brace-expansion: 2.0.2`  
   - Top-level `overrides` and `pnpm.overrides`  
   - Range selectors `brace-expansion@>=2.1.0 <3` and `brace-expansion@>=5` also forced to `2.0.2`  
   - Direct dependency `brace-expansion@2.0.2`

2. **Interop patch (secondary / soft)** — `scripts/patch-brace-expansion-cjs.cjs`  
   - Still runs on postinstall / eas-build-post-install.  
   - With 2.0.2 present it becomes a no-op (verify already passes).  
   - Retained as safety net if a transitive still resolves a 5.x build.

3. **Pre/post guard** — `scripts/ensure-brace-expansion.cjs`  
   Verifies minimatch-style interop; force-installs 2.0.2 if needed.

4. **Hoist** — `.npmrc` `public-hoist-pattern` for `brace-expansion` / `minimatch` + `node-linker=hoisted` + `shamefully-hoist=true`.

5. **EAS profile** — `EAS_SKIP_AUTO_FINGERPRINT=1` on the base profile.

6. **CI** — EAS Build is **manual-only** (`workflow_dispatch`).

## Exit criteria (when to remove pins / shim)

Remove the override and scripts when **all** of the following are true:

- `@react-native/codegen` / `minimatch` consume brace-expansion via named ESM import, **or**
- `brace-expansion` ships `exports.default` on its CJS build for every major line in the tree, **and**
- A clean EAS production Android build succeeds with the override and shim disabled.

## Local verification

```bash
pnpm install
node scripts/ensure-brace-expansion.cjs
node scripts/patch-brace-expansion-cjs.cjs
node -e "const be=require('brace-expansion'); const i=be&&be.__esModule?be:{default:be}; console.log(typeof i.default, i.default('{a,b}'))"
```

Expected: `function [ 'a', 'b' ]`

Then run one production build from **Actions → EAS Build → Run workflow** (or `eas build -p android --profile production`).

In Gradle logs, confirm codegen tasks complete without `(0 , brace_expansion_1.default) is not a function`.
