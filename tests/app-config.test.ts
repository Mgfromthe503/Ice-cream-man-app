import { describe, expect, it } from "vitest";

import appConfig from "../app.config";
import {
  APP_BUNDLE_ID,
  APP_SCHEME,
  APP_SLUG,
  EAS_PROJECT_ID,
  EXPO_OWNER,
} from "../config/app-identity.js";

describe("app identity configuration", () => {
  it("exports centralized identity constants", () => {
    expect(APP_SLUG).toBe("the-ice-cream-man");
    expect(APP_SCHEME).toBe("manusapp");
    expect(APP_BUNDLE_ID).toBe("com.icecreamman.app");
    expect(EAS_PROJECT_ID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(EXPO_OWNER).toBeTruthy();
  });

  it("keeps Expo app identity centralized and consistent", () => {
    expect(appConfig.slug).toBe(APP_SLUG);
    expect(appConfig.scheme).toBe(APP_SCHEME);
    expect(appConfig.ios?.bundleIdentifier).toBe(APP_BUNDLE_ID);
    expect(appConfig.android?.package).toBe(APP_BUNDLE_ID);
    expect(appConfig.owner).toBe(EXPO_OWNER);
  });

  it("includes the canonical EAS project id", () => {
    expect(appConfig.extra).toMatchObject({
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    });
  });
});
