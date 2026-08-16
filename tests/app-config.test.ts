import { describe, expect, it } from "vitest";

import {
  APP_BUNDLE_ID,
  APP_NAME,
  APP_SCHEME,
  APP_SLUG,
  EAS_PROJECT_ID,
  EXPO_OWNER,
} from "../config/app-identity.js";

describe("clean launch app identity", () => {
  it("uses the isolated app slug", () => {
    expect(APP_SLUG).toBe("the-ice-cream-man-launch");
  });

  it("uses the isolated deep-link scheme", () => {
    expect(APP_SCHEME).toBe("icecreamman-launch");
  });

  it("uses the isolated Android/iOS application ID", () => {
    expect(APP_BUNDLE_ID).toBe("com.icecreamman.launch");
  });

  it("does not inherit the old EAS project ID by default", () => {
    expect(EAS_PROJECT_ID).toBe(process.env.EAS_PROJECT_ID ?? "");
  });

  it("uses the intended Expo account owner", () => {
    expect(EXPO_OWNER).toBe("mgfromthe503");
  });
});

describe("clean launch identity alignment", () => {
  it("has valid Android package segments", () => {
    const segments = APP_BUNDLE_ID.split(".");
    for (const seg of segments) {
      expect(/^[a-zA-Z]/.test(seg)).toBe(true);
    }
  });

  it("has a valid deep-link scheme", () => {
    expect(/^[a-z][a-z0-9+\-.]*$/.test(APP_SCHEME)).toBe(true);
  });

  it("keeps the public app name", () => {
    expect(APP_NAME).toBe("The Ice Cream Man");
  });
});
