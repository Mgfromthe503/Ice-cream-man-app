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

**Tracked builds:** `4b4c43bd`, `8a526540`, `58d67abe` (Android / production / STORE / SDK 54.0.34).

## Root cause (confirmed)

| Package | Behavior |
|---------|----------|
| `minimatch@9.x` | CJS build uses `__importDefault(require("brace-expansion")).default(...)` |
| `brace-expansion@5.0.5` (and 5.0.6+) | CJS build sets `__esModule: true` and **only** `exports.expand = expand` — **no** `exports.default` |

TypeScript `__importDefault` returns the module unchanged when `__esModule` is true, so `.default` is `undefined`.

Pinning alone to 5.0.5 is **not** sufficient. An interop patch must inject `exports.default`.

Documented upstream: [expo/eas-cli#3695](https://github.com/expo/eas-cli/issues/3695).

## Fix layers (defense-in-depth)

1. **Interop patch (primary)** — `scripts/patch-brace-expansion-cjs.cjs`  
   - In-place append on the real CJS entry so `exports.default` is the expand function.  
   - Root `interop.cjs` + `package.json` `main` / `exports.require` pointed at it (`.cjs` is always CommonJS even under `"type": "module"`).  
   - Runs via `postinstall` and `eas-build-post-install`.

2. **Pre/post guard** — `scripts/ensure-brace-expansion.cjs`  
   Verifies minimatch-style interop; force-installs 5.0.5 if needed. Soft-fails when only `.default` is missing so the patch can finish the job.

3. **Absolute override** — `brace-expansion: 5.0.5` in both `overrides` and `pnpm.overrides`  
   Single version in the tree (no range selectors).

4. **Direct dependency** — `brace-expansion@5.0.5` in `dependencies`.

5. **Hoist** — `.npmrc` `public-hoist-pattern` for `brace-expansion` / `minimatch` + `node-linker=hoisted`.

6. **EAS profile** — `EAS_SKIP_AUTO_FINGERPRINT=1` on the base profile.

7. **CI** — EAS Build is **manual-only** (`workflow_dispatch`).

## Exit criteria (when to remove pins / shim)

Remove the shim and override when **all** of the following are true:

- `@react-native/codegen` / `minimatch` consume brace-expansion via named ESM import, **or**
- `brace-expansion` ships `exports.default` on its CJS build, **and**
- A clean EAS production Android build succeeds with the shim disabled.

## Local verification

```bash
pnpm install
node scripts/ensure-brace-expansion.cjs
node scripts/patch-brace-expansion-cjs.cjs
node -e "const be=require('brace-expansion'); const i=be&&be.__esModule?be:{default:be}; console.log(typeof i.default, i.default('{a,b}'))"
```

Then run one production build from **Actions → EAS Build → Run workflow** (or `eas build -p android --profile production`).

In Gradle logs, confirm codegen tasks complete without `(0 , brace_expansion_1.default) is not a function`.
