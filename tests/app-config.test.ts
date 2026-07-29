import { describe, expect, it } from "vitest";
import {
  APP_BUNDLE_ID,
  APP_NAME,
  APP_SCHEME,
  APP_SLUG,
  EAS_PROJECT_ID,
} from "../config/app-identity.js";
import appConfig from "../app.config";

describe("app identity constants", () => {
  it("exports the canonical app name", () => {
    expect(APP_NAME).toBe("The Ice Cream Man");
  });

  it("exports the canonical Expo slug", () => {
    expect(APP_SLUG).toBe("the-ice-cream-man");
  });

  it("exports the canonical deep-link scheme", () => {
    expect(APP_SCHEME).toBe("manusapp");
  });

  it("exports the canonical bundle / package ID", () => {
    expect(APP_BUNDLE_ID).toBe("com.icecreamman.app");
  });

  it("bundle ID segments all start with a letter (Android requirement)", () => {
    for (const seg of APP_BUNDLE_ID.split(".")) {
      expect(/^[a-zA-Z]/.test(seg)).toBe(true);
    }
  });

  it("deep-link scheme contains only valid URL scheme characters", () => {
    expect(/^[a-z][a-z0-9+\-.]*$/.test(APP_SCHEME)).toBe(true);
  });

  it("EAS project ID is a non-empty string", () => {
    expect(EAS_PROJECT_ID).toBeTruthy();
    expect(typeof EAS_PROJECT_ID).toBe("string");
  });
});

describe("app.config.ts alignment with app-identity constants", () => {
  it("uses the canonical slug", () => {
    expect(appConfig.slug).toBe(APP_SLUG);
  });

  it("uses the canonical deep-link scheme", () => {
    expect(appConfig.scheme).toBe(APP_SCHEME);
  });

  it("uses the canonical iOS bundle ID", () => {
    expect(appConfig.ios?.bundleIdentifier).toBe(APP_BUNDLE_ID);
  });

  it("uses the canonical Android package name", () => {
    expect(appConfig.android?.package).toBe(APP_BUNDLE_ID);
  });

  it("includes the EAS project ID in extra.eas.projectId", () => {
    expect(appConfig.extra?.eas?.projectId).toBe(EAS_PROJECT_ID);
  });
});
