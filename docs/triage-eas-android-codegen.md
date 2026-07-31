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

**Tracked builds:** `4b4c43bd-b307-429e-90d1-cd321bc96405`, `8a526540-d7d1-4443-b0d6-acb1c8b5b02f` (Android / production / STORE / SDK 54.0.34 / commit `b6f9294`).

## Root cause

| Package | Behavior |
|---------|----------|
| `minimatch@9.x` | CJS build uses `__importDefault(require("brace-expansion")).default(...)` |
| `brace-expansion@5.0.6+` / `@2.1.0+` | ESM-only named export `expand`; **no** CJS-friendly default |

Documented upstream: [expo/eas-cli#3695](https://github.com/expo/eas-cli/issues/3695).

## Fix layers (professional defense-in-depth)

1. **Interop code (primary)** — `scripts/patch-brace-expansion-cjs.cjs`  
   Runs via `postinstall` and `eas-build-post-install` on EAS workers. Walks hoisted + pnpm virtual store installs, rewrites entrypoints so `require("brace-expansion")` is a function **and** exposes `.default` / `.expand`, and normalizes `package.json` `main`/`exports.require` so Gradle's node process cannot bypass the wrapper.

2. **Pre/post guard** — `scripts/ensure-brace-expansion.cjs`  
   Runs on `eas-build-pre-install` and again before the patch on `eas-build-post-install`. Verifies callable export; attempts a precise reinstall of `5.0.5` if broken.

3. **Direct dependency** — `brace-expansion@5.0.5` in `dependencies`  
   Last known CJS-compatible 5.x line so install prefers a good baseline.

4. **Selective resolution pins (secondary only)** — broken ranges only:  
   `brace-expansion@>=5.0.6` → `5.0.5`, `brace-expansion@>=2.1.0 <3` → `2.0.2`  
   (Expo-recommended workaround; not a blanket freeze of the tree.)

5. **Hoist** — `.npmrc` `public-hoist-pattern` for `brace-expansion` / `minimatch` + `node-linker=hoisted` so RN codegen sees one CJS-safe copy.

6. **EAS profile** — `EAS_SKIP_AUTO_FINGERPRINT=1` on the base profile so fingerprint does not reintroduce the same crash path.

7. **CI** — EAS Build is **manual-only** (`workflow_dispatch`) to stop burning Expo quota on every push. Workflow steps run patch + minimatch-path verification before `eas build`.

## Exit criteria (when to remove pins / shim)

Remove the shim and selective pins when **all** of the following are true:

- `@react-native/codegen` / `minimatch` consume brace-expansion via named ESM import, **or**
- `brace-expansion` restores a dual-package CJS default for the versions RN resolves, **and**
- A clean EAS production Android build succeeds with the shim disabled.

## Local verification

```bash
pnpm install
node scripts/ensure-brace-expansion.cjs
node scripts/patch-brace-expansion-cjs.cjs
node -e "const be=require('brace-expansion'); const e=typeof be==='function'?be:be.default; console.log(e('{a,b}'))"
```

Then run one production build from **Actions → EAS Build → Run workflow** (or `eas build -p android --profile production`).

In Gradle logs, confirm codegen tasks complete without `(0 , brace_expansion_1.default) is not a function`.
