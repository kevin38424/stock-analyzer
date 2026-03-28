import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  parseQueryParams: vi.fn(),
  queryParamsWithDefaults: vi.fn((params: URLSearchParams, defaults: Record<string, string>) => ({
    ...defaults,
    ...Object.fromEntries(params.entries()),
  })),
  badRequest: vi.fn((m: string) => ({ kind: "bad", m })),
  notFound: vi.fn((m: string) => ({ kind: "nf", m })),
  ok: vi.fn((d: unknown) => ({ kind: "ok", d })),
  getStockDetailsDataLive: vi.fn(),
}));

vi.mock("@/server/http/parsing", () => ({
  parseQueryParams: mocks.parseQueryParams,
  queryParamsWithDefaults: mocks.queryParamsWithDefaults,
}));
vi.mock("@/server/http/response", () => ({ badRequest: mocks.badRequest, notFound: mocks.notFound, ok: mocks.ok }));
vi.mock("@/server/stocks/get-stock-details-data-live", () => ({ getStockDetailsDataLive: mocks.getStockDetailsDataLive }));

import { GET } from "@/app/api/stocks/[ticker]/details/route";

describe("/api/stocks/[ticker]/details GET", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bad request", async () => {
    mocks.parseQueryParams.mockReturnValue(null);
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() } } as any, { params: Promise.resolve({ ticker: "AAPL" }) })).resolves.toEqual({ kind: "bad", m: "Invalid query parameter: range must be one of 1D, 1W, 1M, 1Y, ALL." });
  });

  it("not found", async () => {
    mocks.parseQueryParams.mockReturnValue({ range: "1M" });
    mocks.getStockDetailsDataLive.mockResolvedValue(null);
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() } } as any, { params: Promise.resolve({ ticker: "AAPL" }) })).resolves.toEqual({ kind: "nf", m: "Ticker not found." });
  });

  it("ok", async () => {
    mocks.parseQueryParams.mockImplementation((request, _schema, mapper) => mapper((request as any).nextUrl.searchParams) as any);
    mocks.getStockDetailsDataLive.mockResolvedValue({ id: 1 });
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams("range=1D") } } as any, { params: Promise.resolve({ ticker: "aapl" }) })).resolves.toEqual({ kind: "ok", d: { id: 1 } });

    await GET({ nextUrl: { searchParams: new URLSearchParams() } } as any, { params: Promise.resolve({ ticker: "aapl" }) });
    expect(mocks.getStockDetailsDataLive).toHaveBeenCalledWith({ ticker: "AAPL", range: "1M" });
  });
});
