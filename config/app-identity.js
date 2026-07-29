/**
 * Canonical Expo/EAS app identity.
 *
 * This is the SINGLE source of truth for all Expo and EAS identity values.
 * Every other file (app.config.ts, constants/oauth.ts, tests, docs) must
 * import from here instead of duplicating these values.
 *
 * To update app identity:
 *   1. Change the value(s) here.
 *   2. Run `pnpm test` to verify nothing drifted.
 *   3. Re-run `eas build:configure` if you changed slug or bundle ID.
 */

/** Display name shown on the device home screen */
export const APP_NAME = "The Ice Cream Man";

/** Expo slug — must match the slug registered in your Expo dashboard */
export const APP_SLUG = "the-ice-cream-man";

/**
 * Deep-link URI scheme used for OAuth callbacks and universal links.
 * Format: <scheme>://<path>
 * e.g. manusapp://oauth/callback
 *
 * This value must also appear in:
 *   - app.config.ts  (scheme field and android intentFilter)
 *   - constants/oauth.ts  (deepLinkScheme)
 */
export const APP_SCHEME = "manusapp";

/** iOS bundle identifier and Android package name (must be identical) */
export const APP_BUNDLE_ID = "com.icecreamman.app";

/**
 * EAS project ID from your Expo dashboard.
 * This is NOT a secret — it is a public project identifier that links
 * builds to the correct Expo project.
 * Obtain by running: eas init
 */
export const EAS_PROJECT_ID = "a7392ba6-c4a2-455d-b03c-9bc0233b7b12";
