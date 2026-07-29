import { describe, expect, it } from "vitest";

import appConfig from "../app.config";
import {
  APP_BUNDLE_ID,
  APP_SCHEME,
  APP_SLUG,
  EAS_PROJECT_ID,
} from "../config/app-identity.js";

describe("app identity configuration", () => {
  it("keeps Expo app identity centralized and consistent", () => {
    expect(appConfig.slug).toBe(APP_SLUG);
    expect(appConfig.scheme).toBe(APP_SCHEME);
    expect(appConfig.ios?.bundleIdentifier).toBe(APP_BUNDLE_ID);
    expect(appConfig.android?.package).toBe(APP_BUNDLE_ID);
  });

  it("includes the canonical EAS project id", () => {
    expect(appConfig.extra).toMatchObject({
      eas: {
        projectId: EAS_PROJECT_ID,
      },
    });
  });
});
