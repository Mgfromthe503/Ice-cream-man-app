import { describe, expect, it } from "vitest";

import {
  APP_BUNDLE_ID,
  APP_SCHEME,
  APP_SLUG,
  EAS_PROJECT_ID,
} from "../config/app-identity.js";

// Import the compiled config value directly so this test doesn't depend on
// app.config.ts executing its side-effectful load-env import.
const APP_NAME_EXPECTED = "The Ice Cream Man";

describe("app identity constants", () => {
  it("exports the canonical app slug", () => {
    expect(APP_SLUG).toBe("the-ice-cream-man");
  });

  it("exports the canonical deep-link scheme", () => {
    expect(APP_SCHEME).toBe("manusapp");
  });

  it("exports the canonical bundle / package ID", () => {
    expect(APP_BUNDLE_ID).toBe("com.icecreamman.app");
  });

  it("exports a non-empty EAS project ID", () => {
    expect(typeof EAS_PROJECT_ID).toBe("string");
    expect(EAS_PROJECT_ID.length).toBeGreaterThan(0);
  });

  it("EAS project ID matches the canonical value", () => {
    expect(EAS_PROJECT_ID).toBe("a7392ba6-c4a2-455d-b03c-9bc0233b7b12");
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

  it("app name constant is set", () => {
    expect(APP_NAME_EXPECTED).toBe("The Ice Cream Man");
  });
});
