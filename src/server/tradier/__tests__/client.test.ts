import { afterEach, describe, expect, it, vi } from "vitest";
import { createTradierClient } from "@/server/tradier/client";

describe("createTradierClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("searches and normalizes securities", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          securities: {
            security: [{ symbol: "nvda", description: "NVIDIA Corp", exch: "Q", type: "stock" }],
          },
        }),
      }),
    );

    const client = createTradierClient({ token: "token", baseUrl: "https://api.test/v1" });
    const results = await client.searchSecurities("nvd");

    expect(results).toEqual([
      {
        symbol: "NVDA",
        description: "NVIDIA Corp",
        exchange: "Q",
        type: "stock",
      },
    ]);
  });

  it("uses POST quotes when symbol list exceeds threshold", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        quotes: {
          quote: [{ symbol: "AAPL", last: 201, prevclose: 200, trade_date: 1757948508561 }],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createTradierClient({ token: "token", baseUrl: "https://api.test/v1" });
    const snapshots = await client.getQuotesAuto(["AAPL", "MSFT"], { postThreshold: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/v1/markets/quotes",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(snapshots[0].symbol).toBe("AAPL");
    expect(snapshots[0].asOf).toBe("2025-09-15T15:01:48.561Z");
  });

  it("creates market session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          stream: { sessionid: "abc-123" },
        }),
      }),
    );

    const client = createTradierClient({ token: "token" });
    const session = await client.createMarketSession();
    expect(session.sessionId).toBe("abc-123");
    expect(new Date(session.expiresAt).toISOString()).toBe(session.expiresAt);
  });
});
