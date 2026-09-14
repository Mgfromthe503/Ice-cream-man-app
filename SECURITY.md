# Security

## Reporting a vulnerability

Please report security issues privately to **Mindy Gaines** at **mindy.gaines1@gmail.com**. Do not open a public issue for a security vulnerability. Include the affected component, steps to reproduce (if any), and any suggested fix.

## Dependency vulnerability status

Tracked via GitHub Dependabot (`repos/Mgfromthe503/Ice-cream-man-app/dependabot/alerts`).

### Open: `image-size` (DoS, build-time only) — accepted / mitigated-by-design

- **Advisories:** [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) (CVE-2025-71330, ICNS parser infinite loop) and [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) (CVE-2025-71329, JXL/HEIF parser infinite loop).
- **Package:** `image-size@1.2.1` (vulnerable range `<= 2.0.2`).
- **Path into the tree:** `image-size` is a **transitive dependency of Metro** (`@expo/cli` → `@expo/metro` → `metro`, and `react-native` → `@react-native/community-cli-plugin` → `metro`). Confirmed with `pnpm why image-size`.
- **Nature of the bug:** A Denial of Service (infinite loop) triggered by crafted image buffers with zero-valued size/length fields. CVSS 7.5 (High), availability only — no confidentiality or integrity impact.
- **Why this is not exploitable in this project:**
  1. **Build-time only.** `image-size` runs inside **Metro**, the bundler, which executes only on a developer machine or in an EAS build server. It is **never shipped in the published app** and is not a runtime module.
  2. **No untrusted input.** Metro calls `image-size` against the project's **own static, developer-controlled assets** (icons, splash, and other bundled images). No remote or user-supplied image is ever parsed.
- **Why a dependency "fix" is intentionally NOT forced:**
  - The upstream npm package has **no patched release yet** — the latest published version is still `2.0.2` (in the vulnerable range). The fix exists only as upstream **PR #439** (not released) and as an unmaintained community fork (`image-size-next`).
  - Overriding Metro's pinned dependency to a third-party fork would add supply-chain risk and could break the Expo/Metro build. The very-low practical risk here does not justify that trade-off.
- **Remediation plan (DO NOT use `image-size-next` fork):** when upstream publishes a patched `image-size` (`> 2.0.2`, from PR #439), bump it via `package.json` → `pnpm.overrides` and re-run `pnpm install` to update `pnpm-lock.yaml`. Re-check Dependabot at that point. Until then this finding is **accepted with the mitigations above**.

## Security practices in this repository

- **No secrets committed.** `google-service-account.json` and related credentials are gitignored. Service-account JSON must be supplied only via a secret manager (Cloud Secret Manager) at deploy time — see `docs/release/google-cloud-deploy.md`.
- **No test-login / reviewer backdoor** in release builds (removed). Secure OAuth sign-in is required.
- **Google Play Billing** purchase tokens are server-verified only; purchase-token hashes are stored for idempotency/replay prevention.
- **Cleartext HTTP disabled** (`withoutCleartext` plugin); API/OAuth are HTTPS-only.
- **Foreground location only**; background location and location foreground services are disabled.
- **No analytics / advertising SDKs** (no Google Analytics, no AdMob, no Google Maps SDK).
