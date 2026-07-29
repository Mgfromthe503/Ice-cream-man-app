import { describe, expect, it } from "vitest";

import appConfig from "../app.config";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const identity = require("../config/app-identity.js");

describe("app identity configuration", () => {
  it("keeps Expo app identity centralized and consistent", () => {
    expect(appConfig.slug).toBe(identity.appSlug);
    expect(appConfig.scheme).toBe(identity.appScheme);
    expect(appConfig.ios?.bundleIdentifier).toBe(identity.bundleId);
    expect(appConfig.android?.package).toBe(identity.androidPackage);
  });

  it("includes the canonical EAS project id", () => {
    expect(appConfig.extra?.eas?.projectId).toBe(identity.easProjectId);
  });
});
