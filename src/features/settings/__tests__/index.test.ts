import { describe, expect, it } from "vitest";
import {
  SettingsPage,
  useSettings,
  useUpdateSettings,
  useUpdateProfile,
  useSecurityActions,
  useApiTokenActions,
} from "@/features/settings";
import * as settingsIndex from "@/features/settings/index";

describe("settings export", () => {
  it("exports settings modules", () => {
    expect(SettingsPage).toBeTypeOf("function");
    expect(useSettings).toBeTypeOf("function");
    expect(useUpdateSettings).toBeTypeOf("function");
    expect(useUpdateProfile).toBeTypeOf("function");
    expect(useSecurityActions).toBeTypeOf("function");
    expect(useApiTokenActions).toBeTypeOf("function");
    expect(settingsIndex.SettingsPage).toBeTypeOf("function");
    expect(settingsIndex.useSettings).toBeTypeOf("function");
    expect(settingsIndex.useUpdateSettings).toBeTypeOf("function");
    expect(settingsIndex.useUpdateProfile).toBeTypeOf("function");
    expect(settingsIndex.useSecurityActions).toBeTypeOf("function");
    expect(settingsIndex.useApiTokenActions).toBeTypeOf("function");
  });
});
