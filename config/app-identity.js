"use strict";
/**
 * Canonical Expo/EAS app identity.
 *
 * This is the SINGLE source of truth for all Expo and EAS identity values.
 * Every other file (app.config.ts, constants/oauth.ts, tests, docs) must
 * import from here instead of duplicating these values.
 *
 * To update app identity:
 *   1. Change the value here.
 *   2. Run `pnpm test` to verify nothing drifted.
 *   3. Re-run `eas build:configure` if you changed slug or bundle ID.
 */
module.exports = {
  /** Display name shown on the device home screen */
  appName: "The Ice Cream Man",

  /** Expo slug — must match the slug in your Expo dashboard */
  appSlug: "the-ice-cream-man",

  /**
   * Deep-link URI scheme used for OAuth callbacks and universal links.
   * Format: <scheme>://<path>
   * e.g. theicecreamman://oauth/callback
   *
   * This value must also appear in:
   *   - app.config.ts  (scheme field)
   *   - constants/oauth.ts  (deepLinkScheme)
   *   - Android intentFilter in app.config.ts
   */
  appScheme: "theicecreamman",

  /** iOS bundle identifier */
  bundleId: "com.icecreamman.app",

  /** Android package name (matches bundleId) */
  androidPackage: "com.icecreamman.app",

  /**
   * EAS project ID from your Expo dashboard.
   * Obtain by running: npx eas init
   * Set EAS_PROJECT_ID in GitHub repo secrets (and optionally in .env).
   * This is NOT a secret — it is a public project identifier.
   */
  easProjectId: process.env.EAS_PROJECT_ID ?? "",
};
