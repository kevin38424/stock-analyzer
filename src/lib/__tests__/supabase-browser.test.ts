import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

describe("supabase-browser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  });

  it("creates client with browser env vars", () => {
    mocks.createClient.mockReturnValue({ browser: true });
    expect(createBrowserSupabaseClient()).toEqual({ browser: true });
    expect(mocks.createClient).toHaveBeenCalledWith("https://x.supabase.co", "anon");
  });
});
