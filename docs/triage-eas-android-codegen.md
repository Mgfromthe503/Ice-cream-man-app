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

## Root cause

| Package | Behavior |
|---------|----------|
| `minimatch@9.x` | CJS build uses `__importDefault(require("brace-expansion")).default(...)` |
| `brace-expansion@5.0.6+` / `@2.1.0+` | ESM-only named export `expand`; **no** CJS-friendly default |

Documented upstream: [expo/eas-cli#3695](https://github.com/expo/eas-cli/issues/3695).

## Fix layers (professional defense-in-depth)

1. **Interop code (primary)** — `scripts/patch-brace-expansion-cjs.cjs`  
   Runs via `eas-build-post-install` on EAS workers. Rewrites installed `brace-expansion` entrypoints so `require("brace-expansion")` is a function **and** exposes `.default` / `.expand`.

2. **Direct dependency** — `brace-expansion@5.0.5` in `dependencies`  
   Last known CJS-compatible 5.x line so install prefers a good baseline.

3. **Selective overrides (secondary)** — only the broken ranges:  
   `brace-expansion@>=5.0.6` → `5.0.5`, `brace-expansion@>=2.1.0 <3` → `2.0.2`  
   (matches Expo’s recommended workaround; not a blanket freeze of the whole tree).

4. **EAS profile** — `EAS_SKIP_AUTO_FINGERPRINT=1` on the base profile so fingerprint does not reintroduce the same crash path.

5. **CI** — EAS Build is **manual-only** (`workflow_dispatch`) to stop burning Expo quota on every push.

## Exit criteria (when to remove pins / shim)

Remove the shim and selective overrides when **all** of the following are true:

- `@react-native/codegen` / `minimatch` consume brace-expansion via named ESM import, **or**
- `brace-expansion` restores a dual-package CJS default for the versions RN resolves, **and**
- A clean EAS production Android build succeeds with the shim disabled.

## Local verification

```bash
pnpm install
node scripts/patch-brace-expansion-cjs.cjs
node -e "const be=require('brace-expansion'); const e=typeof be==='function'?be:be.default; console.log(e('{a,b}'))"
```

Then run one production build from **Actions → EAS Build → Run workflow** (or `eas build -p android --profile production`).
