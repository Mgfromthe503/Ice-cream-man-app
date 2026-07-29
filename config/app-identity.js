// Canonical app identity — single source of truth for all Expo/EAS config.
// Update these values when the project is renamed or re-linked.
export const APP_NAME = "The Ice Cream Man";
export const APP_SLUG = "the-ice-cream-man";
export const APP_BUNDLE_ID = "com.icecreamman.app";
// Deep-link scheme used by OAuth return URLs. Keep aligned with the scheme
// registered in the Manus OAuth app settings from the original project so
// login callbacks continue to open this app.
export const APP_SCHEME = "manusapp";
// Run `eas init --account mgfromthe503 --non-interactive` once to create/link the project.
export const EAS_PROJECT_ID = "a7392ba6-c4a2-455d-b03c-9bc0233b7b12";
// Expo account that owns the EAS project. Must match the account that owns projectId
// (Expo usernames are case-sensitive in EAS project resolution).
export const EXPO_OWNER = "mgfromthe503";
