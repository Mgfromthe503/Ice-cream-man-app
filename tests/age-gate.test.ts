import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AGE_GROUP_KEY,
  getAgeGroup,
  setAgeGroup,
  clearAgeGroup,
} from "../lib/age-gate";

describe("age-gate (13+ audience compliance)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no age group has been confirmed", async () => {
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    await expect(getAgeGroup()).resolves.toBeNull();
  });

  it("returns 13_plus when the 13+ confirmation is stored", async () => {
    (AsyncStorage.getItem as any).mockResolvedValue("13_plus");
    await expect(getAgeGroup()).resolves.toBe("13_plus");
  });

  it("treats any non-13_plus value as not confirmed", async () => {
    (AsyncStorage.getItem as any).mockResolvedValue("under_13");
    await expect(getAgeGroup()).resolves.toBeNull();
  });

  it("persists the 13_plus confirmation", async () => {
    await setAgeGroup("13_plus");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(AGE_GROUP_KEY, "13_plus");
  });

  it("clears the confirmation when an invalid group is set", async () => {
    await setAgeGroup("under_13" as never);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(AGE_GROUP_KEY);
  });

  it("clearAgeGroup removes the stored confirmation", async () => {
    await clearAgeGroup();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(AGE_GROUP_KEY);
  });
});
