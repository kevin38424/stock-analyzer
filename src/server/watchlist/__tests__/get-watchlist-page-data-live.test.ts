import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getMockWatchlistPageData: vi.fn(),
  hasServerSupabaseEnv: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/watchlist/get-watchlist-page-data", () => ({ getMockWatchlistPageData: mocks.getMockWatchlistPageData }));
vi.mock("@/server/supabase-server", () => ({
  hasServerSupabaseEnv: mocks.hasServerSupabaseEnv,
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import { getWatchlistPageData } from "@/server/watchlist/get-watchlist-page-data-live";

function withChain(value: any) {
  const p = Promise.resolve(value);
  (p as any).eq = vi.fn().mockReturnValue(p);
  (p as any).order = vi.fn().mockReturnValue(p);
  return p;
}

describe("getWatchlistPageData(live)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMockWatchlistPageData.mockReturnValue({ source: "mock" });
  });

  it("falls back when no env or user", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);
    await expect(getWatchlistPageData({ userId: null, segment: "all_holdings", sortBy: "score_desc" } as any)).resolves.toEqual({ source: "mock" });

    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    await expect(getWatchlistPageData({ userId: null, segment: "all_holdings", sortBy: "score_desc" } as any)).resolves.toEqual({ source: "mock" });
  });

  it("maps live rows", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi
        .fn()
        .mockReturnValueOnce({ select: vi.fn(() => withChain({ data: [{ ticker: "nvda", company_name: "NVIDIA", sector: null, segment: "tech_growth", thesis: null, score: 90, price: 10, change_percent: 1, delta_score: 2, recommendation: "strong buy" }], error: null })) })
        .mockReturnValueOnce({ select: vi.fn(() => withChain({ count: 1 })) }),
    });

    const out = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "score_desc" } as any);
    expect(out.rows[0].ticker).toBe("NVDA");
    expect(out.totalTracked).toBe(1);
  });

  it("covers sort branches and empty filtered state", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockImplementation(() => ({
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn(() =>
            withChain({
              data: [
                { ticker: "aaa", company_name: "A", sector: "S", segment: "all_holdings", thesis: null, score: 10, price: 2, change_percent: -1, delta_score: -2, recommendation: "HOLD" },
                { ticker: "bbb", company_name: "B", sector: "S", segment: "all_holdings", thesis: null, score: 20, price: 1, change_percent: 1, delta_score: 3, recommendation: "BUY" },
              ],
              error: null,
            }),
          ),
        })
        .mockReturnValueOnce({ select: vi.fn(() => withChain({ count: 2 })) }),
    }));

    const a = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "score_asc" } as any);
    expect(a.rows[0].ticker).toBe("AAA");
    const b = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "delta_desc" } as any);
    expect(b.rows[0].ticker).toBe("BBB");
    const c = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "delta_asc" } as any);
    expect(c.rows[0].ticker).toBe("AAA");
    const d = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "price_desc" } as any);
    expect(d.rows[0].ticker).toBe("AAA");
    const e = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "price_asc" } as any);
    expect(e.rows[0].ticker).toBe("BBB");
    const f = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "score_desc" } as any);
    expect(f.rows[0].ticker).toBe("BBB");

    const empty = await getWatchlistPageData({ userId: "u", segment: "tech_growth", sortBy: "score_desc" } as any);
    expect(empty.rows).toEqual([]);
    expect(empty.kpis.averageScore.detail).toBeUndefined();
  });

  it("covers null numeric fields and totalTracked fallback", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn(() =>
            withChain({
              data: [
                { ticker: "abc", company_name: "ABC", sector: null, segment: "all_holdings", thesis: null, score: null, price: null, change_percent: null, delta_score: null, recommendation: null },
              ],
              error: null,
            }),
          ),
        })
        .mockReturnValueOnce({ select: vi.fn(() => withChain({ count: null })) }),
    });

    const out = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "score_desc" } as any);
    expect(out.rows[0].sector).toBe("Unknown");
    expect(out.rows[0].score).toBe(0);
    expect(out.rows[0].deltaScore).toBe(0);
    expect(out.rows[0].price).toBe(0);
    expect(out.rows[0].changePercent).toBe(0);
    expect(out.rows[0].thesis).toBe("No thesis added yet.");
    expect(out.totalTracked).toBe(1);
  });

  it("formats negative big-upgrade detail without plus sign", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn(() =>
            withChain({
              data: [
                { ticker: "aaa", company_name: "A", sector: "S", segment: "all_holdings", thesis: null, score: 10, price: 2, change_percent: -1, delta_score: -2, recommendation: "HOLD" },
                { ticker: "bbb", company_name: "B", sector: "S", segment: "all_holdings", thesis: null, score: 9, price: 1, change_percent: -1, delta_score: -1, recommendation: "HOLD" },
              ],
              error: null,
            }),
          ),
        })
        .mockReturnValueOnce({ select: vi.fn(() => withChain({ count: 2 })) }),
    });

    const out = await getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "score_desc" } as any);
    expect(out.kpis.bigUpgrade.detail).toBe("-1");
  });

  it("falls back on query error and throw", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi
        .fn()
        .mockReturnValueOnce({ select: vi.fn(() => withChain({ data: null, error: { message: "x" } })) })
        .mockReturnValueOnce({ select: vi.fn(() => withChain({ count: 0 })) }),
    });
    await expect(getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "score_desc" } as any)).resolves.toEqual({ source: "mock" });

    mocks.createServerSupabaseClient.mockImplementation(() => {
      throw new Error("boom");
    });
    await expect(getWatchlistPageData({ userId: "u", segment: "all_holdings", sortBy: "score_desc" } as any)).resolves.toEqual({ source: "mock" });
  });
});
