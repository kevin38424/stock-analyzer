import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));

import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";

describe("supabase-server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("checks env presence", () => {
    expect(hasServerSupabaseEnv()).toBe(false);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "svc";
    expect(hasServerSupabaseEnv()).toBe(true);
  });

  it("throws when env is missing", () => {
    expect(() => createServerSupabaseClient()).toThrow(/Missing Supabase/);
  });

  it("creates client when env exists", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "svc";
    mocks.createClient.mockReturnValue({ ok: true });

    expect(createServerSupabaseClient()).toEqual({ ok: true });
    expect(mocks.createClient).toHaveBeenCalledWith("https://x.supabase.co", "svc");
  });
});
