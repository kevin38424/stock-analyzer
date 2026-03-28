import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getMockTopStocksPageData: vi.fn(),
  hasServerSupabaseEnv: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/mock-data", () => ({ getMockTopStocksPageData: mocks.getMockTopStocksPageData }));
vi.mock("@/server/supabase-server", () => ({
  hasServerSupabaseEnv: mocks.hasServerSupabaseEnv,
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import { getTopStocksPageData } from "@/server/top-stocks/get-top-stocks-page-data";

const query = {
  limit: 10,
  offset: 0,
  favoritesOnly: false,
  minScore: 0,
  maxScore: 100,
  sector: "all",
  valuationStyle: "growth",
  userId: null,
} as const;

function withChain(value: any) {
  const p = Promise.resolve(value);
  (p as any).eq = vi.fn().mockReturnValue(p);
  (p as any).gte = vi.fn().mockReturnValue(p);
  (p as any).lte = vi.fn().mockReturnValue(p);
  (p as any).order = vi.fn().mockReturnValue(p);
  (p as any).limit = vi.fn().mockReturnValue(p);
  (p as any).maybeSingle = vi.fn().mockReturnValue(p);
  return p;
}

describe("getTopStocksPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMockTopStocksPageData.mockReturnValue({ source: "mock" });
  });

  it("returns mock without env", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);
    await expect(getTopStocksPageData({ ...query })).resolves.toEqual({ source: "mock" });
  });

  it("maps live rows", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "v_top_stock_cards_latest") {
            return withChain({
              data: [
                { as_of_date: "2026-03-28", rank: 2, company_id: "c1", ticker: "AAA", company_name: "A", sector: "Tech", industry: "Chip", total_score: 90, recommendation: "BUY", valuation_style: "growth", price: 10, change_percent: 1, fundamentals_score: 1, momentum_score: 1, sentiment_score: 1, value_score: 1, why_it_ranks: "why", algorithm_note: "note" },
                { as_of_date: "2026-03-28", rank: 1, company_id: "c2", ticker: "BBB", company_name: "B", sector: "Energy", industry: "Oil", total_score: 95, recommendation: "STRONG BUY", valuation_style: "growth", price: 11, change_percent: 2, fundamentals_score: 2, momentum_score: 2, sentiment_score: 2, value_score: 2, why_it_ranks: "why2", algorithm_note: "note2" },
              ],
              error: null,
            });
          }
          if (table === "market_daily_summary") return withChain({ data: { stocks_analyzed: 200 } });
          if (table === "user_favorites") return withChain({ data: [{ company_id: "c1" }, { company_id: "c2" }] });
          return withChain({ data: [] });
        }),
      })),
    });

    const out = await getTopStocksPageData({ ...query, userId: "u" });
    expect(out.rows[0].isFavorite).toBe(true);
    expect(out.summary.totalUniverseCount).toBe(200);
    expect(out.featured.ticker).toBe("BBB");
    expect(out.filterMetadata.sectors).toEqual(["all", "Energy", "Tech"]);
  });

  it("covers pagination nextOffset branch", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "v_top_stock_cards_latest") {
            return withChain({
              data: [
                { as_of_date: "2026-03-28", rank: 1, company_id: "c1", ticker: "AAA", company_name: "A", sector: "Tech", industry: "Chip", total_score: 90, recommendation: "BUY", valuation_style: "growth", price: 10, change_percent: 1, fundamentals_score: 1, momentum_score: 1, sentiment_score: 1, value_score: 1, why_it_ranks: "why", algorithm_note: "note" },
                { as_of_date: "2026-03-28", rank: 2, company_id: "c2", ticker: "BBB", company_name: "B", sector: "Tech", industry: "Chip", total_score: 80, recommendation: "HOLD", valuation_style: "growth", price: 9, change_percent: 0, fundamentals_score: 1, momentum_score: 1, sentiment_score: 1, value_score: 1, why_it_ranks: "why", algorithm_note: "note" },
              ],
              error: null,
            });
          }
          if (table === "market_daily_summary") return withChain({ data: { stocks_analyzed: 2 } });
          return withChain({ data: [] });
        }),
      })),
    });

    const out = await getTopStocksPageData({ ...query, limit: 1, offset: 0 });
    expect(out.page.hasMore).toBe(true);
    expect(out.page.nextOffset).toBe(1);
  });

  it("covers favorites-only, sector filtering, and empty featured fallbacks", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "v_top_stock_cards_latest") {
            return withChain({
              data: [
                { as_of_date: "2026-03-28", rank: 2, company_id: "c2", ticker: "BBB", company_name: "B", sector: null, industry: null, total_score: 50, recommendation: null, valuation_style: "growth", price: null, change_percent: null, fundamentals_score: null, momentum_score: null, sentiment_score: null, value_score: null, why_it_ranks: null, algorithm_note: null },
                { as_of_date: "2026-03-28", rank: 1, company_id: "c1", ticker: "AAA", company_name: "A", sector: "Tech", industry: "Chip", total_score: 60, recommendation: "HOLD", valuation_style: "growth", price: 1, change_percent: 1, fundamentals_score: 1, momentum_score: 1, sentiment_score: 1, value_score: 1, why_it_ranks: "x", algorithm_note: "n" },
              ],
              error: null,
            });
          }
          if (table === "market_daily_summary") return withChain({ data: { stocks_analyzed: 0 } });
          if (table === "user_favorites") return withChain({ data: [{ company_id: "c3" }] });
          return withChain({ data: [] });
        }),
      })),
    });

    const out = await getTopStocksPageData({
      ...query,
      favoritesOnly: true,
      sector: "Tech",
      userId: "u",
      limit: 5,
      offset: 0,
    });
    expect(out.rows).toEqual([]);
    expect(out.featured.ticker).toBe("N/A");
    expect(out.algorithmNote).toMatch(/Current ranking weights/);
    expect(out.filterMetadata.sectors[0]).toBe("all");
  });

  it("covers row null-fallback fields and null favorites list", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "v_top_stock_cards_latest") {
            return withChain({
              data: [
                { as_of_date: "2026-03-28", rank: 1, company_id: "c1", ticker: "AAA", company_name: "A", sector: null, industry: null, total_score: 60, recommendation: "HOLD", valuation_style: "growth", price: null, change_percent: null, fundamentals_score: 1, momentum_score: 1, sentiment_score: 1, value_score: 1, why_it_ranks: "x", algorithm_note: "n" },
              ],
              error: null,
            });
          }
          if (table === "market_daily_summary") return withChain({ data: null });
          if (table === "user_favorites") return withChain({ data: null });
          return withChain({ data: [] });
        }),
      })),
    });

    const out = await getTopStocksPageData({ ...query, userId: "u" });
    expect(out.rows[0].sector).toBe("Unknown");
    expect(out.rows[0].industry).toBe("Unknown");
    expect(out.rows[0].price).toBe(0);
    expect(out.rows[0].changePercent).toBe(0);
    expect(out.summary.totalUniverseCount).toBe(1);
  });

  it("skips invalid favorite company ids", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "v_top_stock_cards_latest") {
            return withChain({
              data: [{ as_of_date: "2026-03-28", rank: 1, company_id: "c1", ticker: "AAA", company_name: "A", sector: "Tech", industry: "Chip", total_score: 90, recommendation: "BUY", valuation_style: "growth", price: 10, change_percent: 1, fundamentals_score: 1, momentum_score: 1, sentiment_score: 1, value_score: 1, why_it_ranks: "why", algorithm_note: "note" }],
              error: null,
            });
          }
          if (table === "market_daily_summary") return withChain({ data: { stocks_analyzed: 1 } });
          if (table === "user_favorites") return withChain({ data: [{ company_id: null }] });
          return withChain({ data: [] });
        }),
      })),
    });

    const out = await getTopStocksPageData({ ...query, userId: "u" });
    expect(out.rows[0].isFavorite).toBe(false);
  });

  it("falls back on query error and thrown error", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => (table === "v_top_stock_cards_latest" ? withChain({ data: null, error: { message: "x" } }) : withChain({ data: null }))),
      })),
    });
    await expect(getTopStocksPageData({ ...query })).resolves.toEqual({ source: "mock" });

    mocks.createServerSupabaseClient.mockImplementation(() => {
      throw new Error("boom");
    });
    await expect(getTopStocksPageData({ ...query })).resolves.toEqual({ source: "mock" });
  });
});
