import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasServerSupabaseEnv: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/server/supabase-server", () => ({
  hasServerSupabaseEnv: mocks.hasServerSupabaseEnv,
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import { getSettingsData, upsertSettingsData } from "@/server/settings/get-settings-data";

function resolvedChain(value: any) {
  const p = Promise.resolve(value);
  (p as any).eq = vi.fn().mockReturnValue(p);
  (p as any).is = vi.fn().mockReturnValue(p);
  (p as any).maybeSingle = vi.fn().mockReturnValue(p);
  return p;
}

describe("settings data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults without env", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);
    const out = await getSettingsData("u");
    expect(out.profile.region).toBe("United States");
  });

  it("reads mapped values from supabase", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "user_profiles") return resolvedChain({ data: { full_name: "K" } });
          if (table === "user_subscriptions") return resolvedChain({ data: { plan_code: "pro" } });
          if (table === "user_preferences") return resolvedChain({ data: { compact_table_density: false } });
          if (table === "user_security_state") return resolvedChain({ data: { mfa_enabled: true } });
          if (table === "user_api_tokens") return resolvedChain({ count: 2 });
          return resolvedChain({ data: null });
        }),
      })),
    });

    const out = await getSettingsData("u");
    expect(out.profile.fullName).toBe("K");
    expect(out.subscription.plan).toBe("pro");
    expect(out.apiAccess.activeTokens).toBe(2);
  });

  it("uses defaults when optional fields/count are missing", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "user_profiles") return resolvedChain({ data: {} });
          if (table === "user_subscriptions") return resolvedChain({ data: {} });
          if (table === "user_preferences") return resolvedChain({ data: {} });
          if (table === "user_security_state") return resolvedChain({ data: {} });
          if (table === "user_api_tokens") return resolvedChain({ count: null });
          return resolvedChain({ data: null });
        }),
      })),
    });

    const out = await getSettingsData("u");
    expect(out.profile.region).toBe("United States");
    expect(out.apiAccess.activeTokens).toBe(0);
    expect(out.preferences.preMarketReminder).toBe(false);
    expect(out.notifications.scoreUpdateDigest).toBe(true);
  });

  it("falls back to defaults on errors", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockImplementation(() => {
      throw new Error("x");
    });
    const out = await getSettingsData("u");
    expect(out.profile.fullName).toBe("");
  });

  it("upsert no-ops when env missing", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);
    await expect(upsertSettingsData("u", { profile: { fullName: "A" } })).resolves.toBeUndefined();
  });

  it("upsert hits update/insert branches", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    const profileMaybe = vi.fn().mockResolvedValueOnce({ data: { user_id: "u" } }).mockResolvedValueOnce({ data: null });
    const prefMaybe = vi.fn().mockResolvedValueOnce({ data: { user_id: "u" } }).mockResolvedValueOnce({ data: null });

    const profileTable = {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: profileMaybe }) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
      insert: vi.fn().mockResolvedValue({}),
    };
    const prefTable = {
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: prefMaybe }) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
      insert: vi.fn().mockResolvedValue({}),
    };

    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => (table === "user_profiles" ? profileTable : prefTable)),
    });

    await upsertSettingsData("u", {
      profile: { fullName: "A" },
      preferences: { compactTableDensity: true, preMarketReminder: false },
      notifications: { priceAlerts: true, scoreUpdateDigest: false },
    });
    await upsertSettingsData("u", { profile: { region: "US" }, preferences: { riskHeatmapOverlay: false }, notifications: { earningsCalendarUpdates: false } });

    expect(profileTable.update).toHaveBeenCalled();
    expect(profileTable.insert).toHaveBeenCalled();
    expect(prefTable.update).toHaveBeenCalled();
    expect(prefTable.insert).toHaveBeenCalled();
  });

  it("skips updates when payload is empty and record exists", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    const profileTable = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "u" } }),
        }),
      }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
      insert: vi.fn().mockResolvedValue({}),
    };
    const prefTable = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "u" } }),
        }),
      }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
      insert: vi.fn().mockResolvedValue({}),
    };

    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => (table === "user_profiles" ? profileTable : prefTable)),
    });

    await upsertSettingsData("u", { profile: {}, preferences: {}, notifications: {} });

    expect(profileTable.update).not.toHaveBeenCalled();
    expect(profileTable.insert).not.toHaveBeenCalled();
    expect(prefTable.update).not.toHaveBeenCalled();
    expect(prefTable.insert).not.toHaveBeenCalled();
  });

  it("does nothing when no sections are provided", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    const from = vi.fn();
    mocks.createServerSupabaseClient.mockReturnValue({ from });

    await upsertSettingsData("u", {});
    expect(from).not.toHaveBeenCalled();
  });

  it("maps profile email/timezone payload keys", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    const profileUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    const profileTable = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "u" } }),
        }),
      }),
      update: profileUpdate,
      insert: vi.fn().mockResolvedValue({}),
    };
    const prefTable = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({}) }),
      insert: vi.fn().mockResolvedValue({}),
    };

    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => (table === "user_profiles" ? profileTable : prefTable)),
    });

    await upsertSettingsData("u", { profile: { email: "a@b.com", timezone: "UTC" } });
    expect(profileUpdate).toHaveBeenCalledWith({ email: "a@b.com", timezone: "UTC" });
  });
});
