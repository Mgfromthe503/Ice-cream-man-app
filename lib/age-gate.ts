import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * The Ice Cream Man is a 13+ app. No child under 13 may use the app, and the app
 * never collects location or any data from anyone under 13. This age gate is the
 * audience control that keeps the app compliant with Google Play Families Policy.
 */
export type AgeGroup = "13_plus";

export const AGE_GROUP_KEY = "icm_age_group";

/**
 * Read the persisted age-group confirmation. Returns null if the user has not
 * confirmed that they are 13 or older (or cleared the confirmation).
 */
export async function getAgeGroup(): Promise<AgeGroup | null> {
  try {
    const value = await AsyncStorage.getItem(AGE_GROUP_KEY);
    return value === "13_plus" ? "13_plus" : null;
  } catch {
    return null;
  }
}

/**
 * Persist the age-group confirmation. This app only supports users 13+; calling
 * with any other value clears the confirmation and blocks use.
 */
export async function setAgeGroup(group: AgeGroup): Promise<void> {
  try {
    if (group === "13_plus") {
      await AsyncStorage.setItem(AGE_GROUP_KEY, "13_plus");
    } else {
      await AsyncStorage.removeItem(AGE_GROUP_KEY);
    }
  } catch {
    // Non-fatal: if persistence fails the age gate will simply show again.
  }
}

/**
 * Clear the age-gate confirmation (e.g., on logout). Use this so a different
 * person on the same device is asked again.
 */
export async function clearAgeGroup(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AGE_GROUP_KEY);
  } catch {
    // Non-fatal
  }
}
