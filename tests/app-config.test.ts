import { describe, expect, it } from "vitest";

import {
  APP_BUNDLE_ID,
  APP_NAME,
  APP_SCHEME,
  APP_SLUG,
  EAS_PROJECT_ID,
  EXPO_OWNER,
} from "../config/app-identity.js";

describe("app identity constants", () => {
  it("exports the canonical app slug", () => {
    expect(APP_SLUG).toBe("the-ice-cream-man");
  });

  it("exports the Manus-compatible deep-link scheme", () => {
    // Must match the scheme registered for OAuth redirects in the original Manus project.
    expect(APP_SCHEME).toBe("manusapp");
  });

  it("exports the canonical bundle / package ID", () => {
    expect(APP_BUNDLE_ID).toBe("com.icecreamman.app");
  });

  it("EAS project ID matches the canonical value", () => {
    expect(EAS_PROJECT_ID).toBe("a7392ba6-c4a2-455d-b03c-9bc0233b7b12");
  });

  it("exports the Expo account owner (required for EAS project resolution)", () => {
    // Must match the Expo account that owns EAS projectId (case-sensitive).
    expect(EXPO_OWNER).toBe("mgfromthe503");
  });
});

describe("app identity alignment", () => {
  it("bundle ID segments all start with a letter (Android requirement)", () => {
    const segments = APP_BUNDLE_ID.split(".");
    for (const seg of segments) {
      expect(/^[a-zA-Z]/.test(seg)).toBe(true);
    }
  });

  it("deep-link scheme contains only valid URL scheme characters", () => {
    expect(/^[a-z][a-z0-9+\-.]*$/.test(APP_SCHEME)).toBe(true);
  });

  it("exports the canonical app name", () => {
    expect(APP_NAME).toBe("The Ice Cream Man");
  });
});
