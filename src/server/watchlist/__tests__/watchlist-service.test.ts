import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  hasServerSupabaseEnv: vi.fn(() => true),
  getWatchlistPageData: vi.fn(),
  resolveCompany: vi.fn(),
}));

vi.mock("@/server/supabase-server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
  hasServerSupabaseEnv: mocks.hasServerSupabaseEnv,
}));
vi.mock("@/server/watchlist/get-watchlist-page-data-live", () => ({
  getWatchlistPageData: mocks.getWatchlistPageData,
}));
vi.mock("@/server/watchlist/watchlist-repository", () => ({
  resolveCompany: mocks.resolveCompany,
}));

import {
  createOrUpdateWatchlistItem,
  fetchWatchlistPageData,
  patchWatchlistItem,
  removeWatchlistItem,
} from "@/server/watchlist/watchlist-service";

describe("watchlist-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
  });

  it("fetchWatchlistPageData proxies to live data provider", async () => {
    mocks.getWatchlistPageData.mockResolvedValue({ rows: [] });
    await expect(fetchWatchlistPageData({ userId: null, segment: "all_holdings", sortBy: "score_desc" })).resolves
      .toEqual({ rows: [] });
  });

  it("createOrUpdateWatchlistItem returns not_found when company is missing", async () => {
    mocks.createServerSupabaseClient.mockReturnValue({});
    mocks.resolveCompany.mockResolvedValue(null);

    await expect(createOrUpdateWatchlistItem({ userId: "u", ticker: "AAPL", segment: "all_holdings" })).resolves
      .toEqual({ kind: "not_found", message: "Company not found for the provided ticker/companyId." });
  });

  it("createOrUpdateWatchlistItem returns mock success when supabase env is missing", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);

    await expect(createOrUpdateWatchlistItem({ userId: "u", ticker: "AAPL", segment: "all_holdings" })).resolves
      .toMatchObject({
        kind: "ok",
        status: 201,
        data: {
          success: true,
          data: {
            user_id: "u",
            ticker: "AAPL",
            segment: "all_holdings",
          },
        },
      });
  });

  it("createOrUpdateWatchlistItem updates existing row", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      }),
    });

    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn(() => ({ update })),
    });
    mocks.resolveCompany.mockResolvedValue({ id: "c1" });

    await expect(createOrUpdateWatchlistItem({ userId: "u", ticker: "AAPL", segment: "all_holdings" })).resolves
      .toEqual({ kind: "ok", data: { success: true, data: { id: 1 } }, status: 200 });
  });

  it("patchWatchlistItem returns not_found when row is missing", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116", message: "missing" } }),
      }),
    });

    mocks.createServerSupabaseClient.mockReturnValue({ from: vi.fn(() => ({ update })) });
    mocks.resolveCompany.mockResolvedValue({ id: "c1" });

    await expect(patchWatchlistItem({ userId: "u", ticker: "AAPL", segment: "all_holdings" })).resolves
      .toEqual({ kind: "not_found", message: "missing" });
  });

  it("patchWatchlistItem returns mock success when supabase env is missing", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);

    await expect(patchWatchlistItem({ userId: "u", ticker: "AAPL", thesis: "test thesis" })).resolves.toMatchObject({
      kind: "ok",
      data: {
        success: true,
        data: {
          user_id: "u",
          ticker: "AAPL",
          thesis: "test thesis",
        },
      },
    });
  });

  it("removeWatchlistItem returns error when delete fails", async () => {
    const del = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      eq2: vi.fn(),
    });

    const eqSecond = vi.fn().mockResolvedValue({ error: { message: "boom" } });
    const eqFirst = vi.fn().mockReturnValue({ eq: eqSecond });

    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn(() => ({
        delete: vi.fn().mockReturnValue({ eq: eqFirst }),
      })),
    });
    mocks.resolveCompany.mockResolvedValue({ id: "c1" });

    await expect(removeWatchlistItem({ userId: "u", ticker: "AAPL" })).resolves.toEqual({
      kind: "error",
      message: "boom",
    });
  });

  it("removeWatchlistItem returns mock success when supabase env is missing", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);

    await expect(removeWatchlistItem({ userId: "u", ticker: "AAPL" })).resolves.toMatchObject({
      kind: "ok",
      data: {
        success: true,
        data: {
          user_id: "u",
          ticker: "AAPL",
        },
      },
    });
  });
});
