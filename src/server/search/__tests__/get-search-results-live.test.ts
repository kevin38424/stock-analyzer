import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEmptySearchResponse: vi.fn(() => ({ query: "", total: 0, sortedBy: "Relevance", categories: [], trendingSector: { name: "x", changeToday: "x", note: "x" }, results: [] })),
  getSearchResults: vi.fn(() => ({ query: "NVDA", total: 1, sortedBy: "Relevance", categories: [], trendingSector: { name: "x", changeToday: "x", note: "x" }, results: [{ ticker: "NVDA", name: "NVIDIA", sector: "Technology", industry: "Semiconductors", exchange: "NASDAQ", assetType: "stock", marketCapLabel: "$1", score: 90, sentiment: "BULLISH" }] })),
  hasServerSupabaseEnv: vi.fn(),
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/search/get-search-results", () => ({
  getEmptySearchResponse: mocks.getEmptySearchResponse,
  getSearchResults: mocks.getSearchResults,
}));
vi.mock("@/server/supabase-server", () => ({
  hasServerSupabaseEnv: mocks.hasServerSupabaseEnv,
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

import { getSearchResultsLive } from "@/server/search/get-search-results-live";

function withChain(value: any) {
  const p = Promise.resolve(value);
  (p as any).or = vi.fn().mockReturnValue(p);
  (p as any).eq = vi.fn().mockReturnValue(p);
  (p as any).limit = vi.fn().mockReturnValue(p);
  (p as any).order = vi.fn().mockReturnValue(p);
  (p as any).maybeSingle = vi.fn().mockReturnValue(p);
  return p;
}

describe("getSearchResultsLive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty response for blank query", async () => {
    await expect(getSearchResultsLive({ query: "  ", category: "all", limit: 25, includeTrending: true })).resolves.toEqual({
      query: "",
      total: 0,
      sortedBy: "Relevance",
      categories: [],
      trendingSector: { name: "x", changeToday: "x", note: "x" },
      results: [],
    });
  });

  it("falls back to mock when env is missing", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);
    const out = await getSearchResultsLive({ query: "NVDA", category: "stocks", limit: 5, includeTrending: false });
    expect(mocks.getSearchResults).toHaveBeenCalledWith("NVDA");
    expect(out.results.length).toBe(1);
    expect(out.categories).toEqual([
      { key: "all", label: "All Results", count: 1 },
      { key: "stocks", label: "Stocks", count: 1 },
      { key: "etfs", label: "ETFs", count: 0 },
      { key: "options", label: "Options", count: 0 },
    ]);
    expect(out.trendingSector.name).toBe("N/A");
  });

  it("maps live rows from supabase", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "v_search_cards_latest") {
            return withChain({
              data: [
                {
                  ticker: "NVDA",
                  company_name: "NVIDIA Corp",
                  sector: "Technology",
                  industry: "Semiconductors",
                  exchange: "NASDAQ",
                  asset_type: "stock",
                  market_cap: 2140000000000,
                  total_score: 94,
                  recommendation: "STRONG BUY",
                },
              ],
              error: null,
            });
          }
          if (table === "sector_performance_daily") {
            return withChain({ data: { sector: "Semiconductors", change_percent: 4.2 }, error: null });
          }
          return withChain({ data: [], error: null });
        }),
      })),
    });

    const out = await getSearchResultsLive({ query: "NVDA", category: "all", limit: 25, includeTrending: true });
    expect(out.total).toBe(1);
    expect(out.results[0].marketCapLabel).toBe("$2.14T");
    expect(out.trendingSector.changeToday).toBe("+4.2%");
  });

  it("keeps global category counts while applying selected category filter", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "v_search_cards_latest") {
            return withChain({
              data: [
                {
                  ticker: "AAPL",
                  company_name: "Apple Inc.",
                  sector: "Technology",
                  industry: "Consumer Electronics",
                  exchange: "NASDAQ",
                  asset_type: "stock",
                  market_cap: 2000000000000,
                  total_score: 93,
                  recommendation: "BUY",
                },
                {
                  ticker: "SOXX",
                  company_name: "iShares Semiconductor ETF",
                  sector: "ETF",
                  industry: "Semiconductor Index",
                  exchange: "NASDAQ",
                  asset_type: "etf",
                  market_cap: 13000000000,
                  total_score: 74,
                  recommendation: "HOLD",
                },
              ],
              error: null,
            });
          }
          if (table === "sector_performance_daily") {
            return withChain({ data: { sector: "Technology", change_percent: 1.1 }, error: null });
          }
          return withChain({ data: [], error: null });
        }),
      })),
    });

    const out = await getSearchResultsLive({ query: "A", category: "stocks", limit: 25, includeTrending: true });
    expect(out.total).toBe(1);
    expect(out.categories).toEqual([
      { key: "all", label: "All Results", count: 2 },
      { key: "stocks", label: "Stocks", count: 1 },
      { key: "etfs", label: "ETFs", count: 1 },
      { key: "options", label: "Options", count: 0 },
    ]);
    expect(out.results[0].ticker).toBe("AAPL");
  });

  it("falls back on supabase query failure", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
    mocks.createServerSupabaseClient.mockReturnValue({
      from: vi.fn((table: string) => ({
        select: vi.fn(() => {
          if (table === "v_search_cards_latest") {
            return withChain({ data: null, error: { message: "bad" } });
          }
          return withChain({ data: null, error: null });
        }),
      })),
    });

    await expect(getSearchResultsLive({ query: "NVDA", category: "all", limit: 25, includeTrending: true })).resolves.toMatchObject({
      query: "NVDA",
      sortedBy: "Relevance",
    });
    expect(mocks.getSearchResults).toHaveBeenCalledWith("NVDA");
  });
});
