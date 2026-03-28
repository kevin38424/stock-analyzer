import { afterEach, describe, expect, it, vi } from "vitest";
import { createTradierProvider } from "@/server/market-data/providers/tradier-provider";

describe("createTradierProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes valid quotes and filters invalid rows", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        quotes: {
          quote: [
            {
              symbol: "aapl",
              last: 201.45,
              prevclose: 199.45,
              change_percentage: 1.0,
              market_cap: 3300000000000,
              volume: 12345.67,
            },
            {
              symbol: "bad",
              last: -1,
            },
          ],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const provider = createTradierProvider("token-1", "https://api.test/v1/");
    const quotes = await provider.fetchQuotes(["aapl", "bad"]);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/v1/markets/quotes?symbols=AAPL%2CBAD&greeks=false",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toEqual(
      expect.objectContaining({
        ticker: "AAPL",
        price: 201.45,
        previousClose: 199.45,
        changePercent: 1,
        marketCap: 3300000000000,
        volume: 12345,
        sourceProvider: "tradier",
      }),
    );
    expect(new Date(quotes[0].fetchedAt).toISOString()).toBe(quotes[0].fetchedAt);
  });

  it("derives change percent when payload omits it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          quotes: { quote: { symbol: "msft", last: 220, prevclose: 200 } },
        }),
      }),
    );

    const provider = createTradierProvider("token-1");
    const quotes = await provider.fetchQuotes(["msft"]);

    expect(quotes[0].changePercent).toBe(10);
  });

  it("throws when provider response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      }),
    );
    const provider = createTradierProvider("token-1");

    await expect(provider.fetchQuotes(["AAPL"])).rejects.toThrow("Tradier request failed (GET /markets/quotes): 429");
  });
});
