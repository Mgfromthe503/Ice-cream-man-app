export const APP_NAME = "The Ice Cream Man";
export const APP_SLUG = "the-ice-cream-man";
export const APP_BUNDLE_ID = "com.icecreamman.app";
export const EAS_PROJECT_ID = "a7392ba6-c4a2-455d-b03c-9bc0233b7b12";

export function getDeepLinkSchemeFromBundleId(bundleId) {
  const suffix = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
  return `manus${suffix}`;
}

export const APP_SCHEME = getDeepLinkSchemeFromBundleId(APP_BUNDLE_ID);
