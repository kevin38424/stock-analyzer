import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  badRequest: vi.fn((message: string) => ({ kind: "bad", message })),
  ok: vi.fn((data: unknown) => ({ kind: "ok", data })),
  ensureFreshQuotesForTickers: vi.fn(),
}));

vi.mock("@/server/http/response", () => ({
  badRequest: mocks.badRequest,
  ok: mocks.ok,
}));

vi.mock("@/server/market-data/quote-sync", () => ({
  ensureFreshQuotesForTickers: mocks.ensureFreshQuotesForTickers,
}));

import { GET } from "@/app/api/market/quotes/route";

describe("/api/market/quotes GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns bad request for invalid query", async () => {
    const response = await GET({ nextUrl: { searchParams: new URLSearchParams() } } as any);
    expect(response).toEqual({
      kind: "bad",
      message: "Invalid query parameters. Use symbols=AAPL,MSFT and optional maxAgeSeconds=60.",
    });
  });

  it("returns bad request when symbols resolve to empty list", async () => {
    const response = await GET({ nextUrl: { searchParams: new URLSearchParams("symbols=,,,") } } as any);
    expect(response).toEqual({
      kind: "bad",
      message: "At least one symbol is required.",
    });
  });

  it("returns filtered quote payload for requested symbols", async () => {
    mocks.ensureFreshQuotesForTickers.mockResolvedValue(
      new Map([
        [
          "AAPL",
          {
            ticker: "AAPL",
            price: 200,
            previousClose: 198,
            changePercent: 1.01,
            marketCap: 1,
            volume: 1,
            fetchedAt: "2026-03-28T00:00:00.000Z",
            sourceProvider: "manual",
          },
        ],
      ]),
    );

    const response = await GET({
      nextUrl: { searchParams: new URLSearchParams("symbols=aapl, msft&maxAgeSeconds=90") },
    } as any);

    expect(mocks.ensureFreshQuotesForTickers).toHaveBeenCalledWith(["AAPL", "MSFT"], {
      maxAgeSeconds: 90,
      runKind: "on_demand",
    });
    expect(response).toEqual({
      kind: "ok",
      data: {
        requested: ["AAPL", "MSFT"],
        quotes: [
          {
            ticker: "AAPL",
            price: 200,
            previousClose: 198,
            changePercent: 1.01,
            marketCap: 1,
            volume: 1,
            fetchedAt: "2026-03-28T00:00:00.000Z",
            sourceProvider: "manual",
          },
        ],
      },
    });
  });
});
