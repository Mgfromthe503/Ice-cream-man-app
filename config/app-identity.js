// Canonical identity for the clean parallel launch track.
// The production identity is intentionally separate from the existing Play app.

export const APP_NAME = "The Ice Cream Man";
export const APP_SLUG = "the-ice-cream-man-launch";
export const APP_BUNDLE_ID = "com.icecreamman.launch";
export const APP_SCHEME = "icecreamman-launch";
export const EXPO_OWNER = "mgfromthe503";

// Supplied by CI after the NEW EAS project is created.
// This deliberately does not inherit the old production project ID.
export const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID ?? "";
