import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hasServerSupabaseEnv: vi.fn(),
  createServerSupabaseClient: vi.fn(),
  getMarketDataProvider: vi.fn(),
  getQuoteFreshnessSeconds: vi.fn(() => 60),
}));

vi.mock("@/server/supabase-server", () => ({
  hasServerSupabaseEnv: mocks.hasServerSupabaseEnv,
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

vi.mock("@/server/market-data/provider-registry", () => ({
  getMarketDataProvider: mocks.getMarketDataProvider,
  getQuoteFreshnessSeconds: mocks.getQuoteFreshnessSeconds,
}));

import { ensureFreshQuotesForTickers } from "@/server/market-data/quote-sync";

describe("ensureFreshQuotesForTickers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasServerSupabaseEnv.mockReturnValue(true);
  });

  it("returns empty map when supabase env is unavailable", async () => {
    mocks.hasServerSupabaseEnv.mockReturnValue(false);

    const out = await ensureFreshQuotesForTickers(["AAPL"]);
    expect(out.size).toBe(0);
    expect(mocks.createServerSupabaseClient).not.toHaveBeenCalled();
  });

  it("returns latest DB quotes when provider is missing", async () => {
    mocks.getMarketDataProvider.mockReturnValue(null);

    const companyRows = [{ id: "c1", ticker: "AAPL" }];
    const latestQuote = {
      company_id: "c1",
      price: 190.12,
      previous_close: 188.5,
      change_percent: 0.86,
      market_cap: 3000000000000,
      volume: 1000,
      fetched_at: new Date().toISOString(),
      source_provider: "manual",
    };

    const companyIn = vi.fn().mockResolvedValue({ data: companyRows, error: null });
    const latestIn = vi
      .fn()
      .mockResolvedValueOnce({ data: [latestQuote], error: null })
      .mockResolvedValueOnce({ data: [latestQuote], error: null });

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "companies") return { select: vi.fn(() => ({ in: companyIn })) };
        if (table === "stock_quotes_latest") return { select: vi.fn(() => ({ in: latestIn })) };
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const out = await ensureFreshQuotesForTickers(["aapl"], { supabase: supabase as any });

    expect(out.get("AAPL")).toEqual({
      ticker: "AAPL",
      price: 190.12,
      previousClose: 188.5,
      changePercent: 0.86,
      marketCap: 3000000000000,
      volume: 1000,
      fetchedAt: latestQuote.fetched_at,
      sourceProvider: "manual",
    });
  });

  it("refreshes stale quotes and logs successful sync run", async () => {
    const fetchedAtStale = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const fetchedAtFresh = new Date().toISOString();
    const fetchQuotes = vi.fn().mockResolvedValue([
      {
        ticker: "AAPL",
        price: 201.2,
        previousClose: 198,
        changePercent: 1.61,
        marketCap: 3100000000000,
        volume: 2000,
        fetchedAt: fetchedAtFresh,
        sourceProvider: "tradier",
      },
    ]);
    mocks.getMarketDataProvider.mockReturnValue({ name: "tradier", fetchQuotes });

    const companyIn = vi.fn().mockResolvedValue({ data: [{ id: "c1", ticker: "AAPL" }], error: null });
    const latestIn = vi
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            company_id: "c1",
            price: 180,
            previous_close: 179,
            change_percent: 0.5,
            market_cap: 1,
            volume: 1,
            fetched_at: fetchedAtStale,
            source_provider: "manual",
          },
        ],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            company_id: "c1",
            price: 201.2,
            previous_close: 198,
            change_percent: 1.61,
            market_cap: 3100000000000,
            volume: 2000,
            fetched_at: fetchedAtFresh,
            source_provider: "tradier",
          },
        ],
        error: null,
      });
    const upsertQuotes = vi.fn().mockResolvedValue({ error: null });
    const runUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const runUpdate = vi.fn(() => ({ eq: runUpdateEq }));
    const runInsertSingle = vi.fn().mockResolvedValue({ data: { id: "run-1" }, error: null });
    const runInsertSelect = vi.fn(() => ({ single: runInsertSingle }));
    const runInsert = vi.fn(() => ({ select: runInsertSelect }));

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "companies") return { select: vi.fn(() => ({ in: companyIn })) };
        if (table === "stock_quotes_latest") return { select: vi.fn(() => ({ in: latestIn })), upsert: upsertQuotes };
        if (table === "market_data_sync_runs") return { insert: runInsert, update: runUpdate };
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const out = await ensureFreshQuotesForTickers(["AAPL"], { supabase: supabase as any, runKind: "scheduled" });

    expect(fetchQuotes).toHaveBeenCalledWith(["AAPL"]);
    expect(upsertQuotes).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          company_id: "c1",
          price: 201.2,
          source_provider: "tradier",
        }),
      ],
      { onConflict: "company_id" },
    );
    expect(runUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "succeeded",
        ingested_count: 1,
      }),
    );
    expect(runUpdateEq).toHaveBeenCalledWith("id", "run-1");
    expect(out.get("AAPL")?.price).toBe(201.2);
  });
});
