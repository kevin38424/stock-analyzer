import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getHomeDashboardData: vi.fn(),
  hasServerSupabaseEnv: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/server/home/get-home-dashboard-data", () => ({ getHomeDashboardData: mocks.getHomeDashboardData }));
vi.mock("@/server/supabase-server", () => ({
  hasServerSupabaseEnv: mocks.hasServerSupabaseEnv,
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import { getHomeDashboardDataLive } from "@/server/home/get-home-dashboard-data-live";

function withChain(result: any) {
  const p = Promise.resolve(result);
  (p as any).order = vi.fn().mockReturnValue(p);
  (p as any).limit = vi.fn().mockReturnValue(p);
  (p as any).eq = vi.fn().mockReturnValue(p);
  (p as any).maybeSingle = vi.fn().mockReturnValue(p);
  return p;
}

function makeSupabase(fail = false) {
  const summary = withChain({
    data: { stocks_analyzed: 100, stocks_analyzed_delta: 1, strong_buys: 2, strong_buys_percent: 2.5, average_score: 70, most_improved_delta_score: 3, generated_at: "2026-03-28T00:00:00.000Z", company: { ticker: "NVDA" } },
    error: fail ? { message: "bad" } : null,
  });
  const top = withChain({ data: [{ rank: 1, ticker: "NVDA", company_name: "NVIDIA", sector: "Tech", total_score: 99, recommendation: "STRONG BUY", price: 1, change_percent: 1 }], error: null });
  const sectors = withChain({ data: [{ sector: "Tech", change_percent: 1 }], error: null });
  const distribution = withChain({ data: [{ bin_start: 0, bin_end: 9, count: 2 }], error: null });
  const watchlist = withChain({ data: [{ ticker: "AAPL", company_name: "Apple", score: 80, recommendation: "BUY", price: 1, change_percent: 1 }], error: null });

  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => {
        if (table === "market_daily_summary") return summary;
        if (table === "v_top_stock_cards_latest") return top;
        if (table === "sector_performance_daily") return sectors;
        if (table === "score_distribution_daily") return distribution;
        if (table === "v_watchlist_rows_latest") return watchlist;
        return withChain({ data: [], error: null });
      }),
    })),
  };
}

function makeSupabaseWithTwoTopRows() {
  const summary = withChain({
    data: { stocks_analyzed: 10, stocks_analyzed_delta: 1, strong_buys: 2, strong_buys_percent: 2, average_score: 50, most_improved_delta_score: 3, generated_at: "2026-03-28T00:00:00.000Z", company: { ticker: "NVDA" } },
    error: null,
  });
  const top = withChain({
    data: [
      { rank: 1, ticker: "NVDA", company_name: "NVIDIA", sector: "Tech", total_score: 99, recommendation: "STRONG BUY", price: 1, change_percent: 1 },
      { rank: 2, ticker: "AAPL", company_name: "Apple", sector: "Tech", total_score: 88, recommendation: "BUY", price: 1, change_percent: 1 },
    ],
    error: null,
  });
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => {
        if (table === "market_daily_summary") return summary;
        if (table === "v_top_stock_cards_latest") return top;
        if (table === "sector_performance_daily") return withChain({ data: [], error: null });
        if (table === "score_distribution_daily") return withChain({ data: [], error: null });
        if (table === "v_watchlist_rows_latest") return withChain({ data: [], error: null });
        return withChain({ data: [], error: null });
      }),
    })),
  };
}

function makeSupabaseWithNullableFields() {
  const summary = withChain({
    data: { stocks_analyzed: 10, stocks_analyzed_delta: 1, strong_buys: 2, strong_buys_percent: 2, average_score: 50, most_improved_delta_score: null, generated_at: "2026-03-28T00:00:00.000Z", company: { ticker: null } },
    error: null,
  });
  const top = withChain({
    data: [{ rank: 1, ticker: "ZZZ", company_name: "Z", sector: null, total_score: 77, recommendation: null, price: null, change_percent: null }],
    error: null,
  });
  const watchlist = withChain({
    data: [{ ticker: "abc", company_name: "ABC", score: null, recommendation: null, price: null, change_percent: null }],
    error: null,
  });
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => {
        if (table === "market_daily_summary") return summary;
        if (table === "v_top_stock_cards_latest") return top;
        if (table === "sector_performance_daily") return withChain({ data: [], error: null });
        if (table === "score_distribution_daily") return withChain({ data: [], error: null });
        if (table === "v_watchlist_rows_latest") return watchlist;
        return withChain({ data: [], error: null });
      }),
    })),
  };
}

function makeSupabaseWithNullSummary() {
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => {
        if (table === "market_daily_summary") return withChain({ data: null, error: null });
        if (table === "v_top_stock_cards_latest") return withChain({ data: [], error: null });
        if (table === "sector_performance_daily") return withChain({ data: [], error: null });
        if (table === "score_distribution_daily") return withChain({ data: [], error: null });
        if (table === "v_watchlist_rows_latest") return withChain({ data: [], error: null });
        return withChain({ data: [], error: null });
      }),
    })),
  };
}

function makeSupabaseWithNullLists() {
  const summary = withChain({
    data: { stocks_analyzed: 1, stocks_analyzed_delta: 0, strong_buys: 0, strong_buys_percent: 0, average_score: 0, most_improved_delta_score: 0, generated_at: "2026-03-28T00:00:00.000Z", company: { ticker: "AAPL" } },
    error: null,
  });
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => {
        if (table === "market_daily_summary") return summary;
        if (table === "v_top_stock_cards_latest") return withChain({ data: null, error: null });
        if (table === "sector_performance_daily") return withChain({ data: null, error: null });
        if (table === "score_distribution_daily") return withChain({ data: null, error: null });
        if (table === "v_watchlist_rows_latest") return withChain({ data: null, error: null });
        return withChain({ data: [], error: null });
      }),
    })),
  };
}

describe("getHomeDashboardDataLive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getHomeDashboardData.mockReturnValue({ generatedAt: "mock", watchlistPreview: [1] });
  });

  it("falls back when env missing", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);
    await expect(getHomeDashboardDataLive({ includeWatchlist: true, userId: null })).resolves.toEqual({ generatedAt: "mock", watchlistPreview: [1] });
    await expect(getHomeDashboardDataLive({ includeWatchlist: false, userId: null })).resolves.toEqual({ generatedAt: "mock", watchlistPreview: [] });
  });

  it("returns live payload", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue(makeSupabase(false));
    const out = await getHomeDashboardDataLive({ includeWatchlist: true, userId: "u" });
    expect(out.kpis.stocksAnalyzed).toBe(100);
    expect(out.topStocks[0].recommendation).toBe("Strong Buy");
  });

  it("falls back on query error or throw", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue(makeSupabase(true));
    await expect(getHomeDashboardDataLive({ includeWatchlist: true, userId: "u" })).resolves.toEqual({ generatedAt: "mock", watchlistPreview: [1] });

    mocks.createServerSupabaseClient.mockImplementation(() => {
      throw new Error("boom");
    });
    await expect(getHomeDashboardDataLive({ includeWatchlist: true, userId: "u" })).resolves.toEqual({ generatedAt: "mock", watchlistPreview: [1] });

    mocks.createServerSupabaseClient.mockReturnValue(makeSupabase(true));
    await expect(getHomeDashboardDataLive({ includeWatchlist: false, userId: null })).resolves.toEqual({
      generatedAt: "mock",
      watchlistPreview: [],
    });
  });

  it("covers includeWatchlist false and insight rich branch", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue(makeSupabaseWithTwoTopRows());
    const out = await getHomeDashboardDataLive({ includeWatchlist: false, userId: null });
    expect(out.watchlistPreview).toEqual([]);
    expect(out.insight.message).toMatch(/currently leads the ranking universe/);
  });

  it("covers nullable live fields and includeWatchlist-false catch fallback", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue(makeSupabaseWithNullableFields());
    const out = await getHomeDashboardDataLive({ includeWatchlist: true, userId: "u" });
    expect(out.topStocks[0].sector).toBe("Unknown");
    expect(out.topStocks[0].changePercent).toBe(0);
    expect(out.watchlistPreview[0].score).toBe(0);
    expect(out.watchlistPreview[0].changePercent).toBe(0);

    mocks.createServerSupabaseClient.mockImplementation(() => {
      throw new Error("boom-2");
    });
    await expect(getHomeDashboardDataLive({ includeWatchlist: false, userId: null })).resolves.toEqual({
      generatedAt: "mock",
      watchlistPreview: [],
    });
  });

  it("covers summary-null defaults", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue(makeSupabaseWithNullSummary());
    const out = await getHomeDashboardDataLive({ includeWatchlist: true, userId: "u" });
    expect(out.kpis.stocksAnalyzed).toBe(0);
    expect(out.kpis.averageScore).toBe(0);
    expect(out.kpis.mostImprovedTicker).toBe("N/A");
  });

  it("covers null list fallbacks", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue(makeSupabaseWithNullLists());
    const out = await getHomeDashboardDataLive({ includeWatchlist: true, userId: "u" });
    expect(out.topStocks).toEqual([]);
    expect(out.sectorPerformance).toEqual([]);
    expect(out.scoreDistribution).toEqual([]);
    expect(out.watchlistPreview).toEqual([]);
  });
});
