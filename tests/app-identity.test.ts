import { describe, it, expect, vi } from "vitest";

// Mock React Native so Vitest can parse the module (react-native uses Flow types)
vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

// Mock expo-linking so deep link creation works without a native context
vi.mock("expo-linking", () => ({
  createURL: vi.fn(
    (path: string, opts?: { scheme?: string }) =>
      `${opts?.scheme ?? "exp"}://${path}`
  ),
  canOpenURL: vi.fn(() => Promise.resolve(true)),
  openURL: vi.fn(() => Promise.resolve()),
}));

// Load canonical identity at module level so all tests share the same reference
// eslint-disable-next-line @typescript-eslint/no-require-imports
const identity = require("../config/app-identity.js");

/** Helper: load the Expo app config (handles both object and function export forms) */
async function loadAppConfig() {
  const { default: appConfig } = await import("../app.config");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof appConfig === "function" ? appConfig({} as any) : appConfig;
}

/**
 * App identity drift-prevention tests.
 *
 * These tests guard against accidental changes to core Expo/EAS identity values.
 * If you intentionally change the slug, scheme, bundle ID, or package name,
 * update config/app-identity.js first, then update the expected values here.
 */
describe("App Identity — drift prevention", () => {
  it("has the canonical app name", () => {
    expect(identity.appName).toBe("The Ice Cream Man");
  });

  it("has the canonical Expo slug", () => {
    // Must match the slug registered in the Expo dashboard.
    expect(identity.appSlug).toBe("the-ice-cream-man");
  });

  it("has the canonical deep-link scheme", () => {
    // Must match app.config.ts `scheme` and constants/oauth.ts `deepLinkScheme`.
    expect(identity.appScheme).toBe("theicecreamman");
  });

  it("has the canonical iOS bundle identifier", () => {
    expect(identity.bundleId).toBe("com.icecreamman.app");
  });

  it("has the canonical Android package name", () => {
    // Must match the app registered in Google Play Console.
    expect(identity.androidPackage).toBe("com.icecreamman.app");
  });

  it("bundle ID and Android package are identical", () => {
    // Expo requires these to match for a consistent build.
    expect(identity.bundleId).toBe(identity.androidPackage);
  });

  it("easProjectId is a string (may be empty in local dev)", () => {
    // In CI, EAS_PROJECT_ID should be set via repo secrets.
    // Run `npx eas init` to generate it for your Expo account.
    expect(typeof identity.easProjectId).toBe("string");
  });

  it("app.config.ts uses the canonical slug", async () => {
    const config = await loadAppConfig();
    expect(config.slug).toBe(identity.appSlug);
  });

  it("app.config.ts uses the canonical scheme", async () => {
    const config = await loadAppConfig();
    expect(config.scheme).toBe(identity.appScheme);
  });

  it("app.config.ts uses the canonical iOS bundle ID", async () => {
    const config = await loadAppConfig();
    expect(config.ios?.bundleIdentifier).toBe(identity.bundleId);
  });

  it("app.config.ts uses the canonical Android package", async () => {
    const config = await loadAppConfig();
    expect(config.android?.package).toBe(identity.androidPackage);
  });

  it("app.config.ts exposes EAS project ID in extra", async () => {
    const config = await loadAppConfig();
    expect(config.extra?.eas?.projectId).toBeDefined();
  });

  it("constants/oauth.ts deepLinkScheme matches canonical scheme", async () => {
    const oauth = await import("../constants/oauth");
    // getRedirectUri on a native platform uses the deep-link scheme.
    // With Platform.OS = 'ios', the redirect URI must start with the scheme.
    const uri = oauth.getRedirectUri();
    expect(uri).toMatch(new RegExp(`^${identity.appScheme}://`));
  });
});
