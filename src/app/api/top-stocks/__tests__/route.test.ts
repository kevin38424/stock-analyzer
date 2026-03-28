import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  parseQueryParams: vi.fn(),
  queryParamsWithDefaults: vi.fn((params: URLSearchParams, defaults: Record<string, string | undefined>) =>
    Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [key, params.get(key) ?? value]),
    ),
  ),
  badRequest: vi.fn((m: string) => ({ kind: "bad", m })),
  ok: vi.fn((d: unknown) => ({ kind: "ok", d })),
  getRequestUserId: vi.fn(() => null),
  getTopStocksPageData: vi.fn(),
}));

vi.mock("@/server/http/parsing", () => ({
  parseQueryParams: mocks.parseQueryParams,
  queryParamsWithDefaults: mocks.queryParamsWithDefaults,
}));
vi.mock("@/server/http/response", () => ({ badRequest: mocks.badRequest, ok: mocks.ok }));
vi.mock("@/server/http/request-context", () => ({ getRequestUserId: mocks.getRequestUserId }));
vi.mock("@/server/top-stocks/get-top-stocks-page-data", () => ({ getTopStocksPageData: mocks.getTopStocksPageData }));

import { GET } from "@/app/api/top-stocks/route";

describe("/api/top-stocks GET", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalid query", async () => {
    mocks.parseQueryParams.mockReturnValue(null);
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({ kind: "bad", m: "Invalid query parameters for top stocks request." });
  });

  it("invalid score range", async () => {
    mocks.parseQueryParams.mockReturnValue({ minScore: 60, maxScore: 10 });
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({ kind: "bad", m: "Invalid score range: minScore cannot be greater than maxScore." });
  });

  it("returns mapped payload", async () => {
    mocks.parseQueryParams.mockImplementation((request, _schema, mapper) => ({
      ...(mapper((request as any).nextUrl.searchParams) as object),
      minScore: 0,
      maxScore: 100,
    }));
    mocks.getTopStocksPageData.mockResolvedValue({ rows: [{ ticker: "A", companyName: "A", sector: "S", score: 80, recommendation: "BUY" }] });
    const out = await GET({ nextUrl: { searchParams: new URLSearchParams("limit=1&offset=0&sector=all") }, headers: new Headers() } as any);
    expect((out as any).d.results[0].analysis.total).toBe(80);

    await GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any);
    expect(mocks.parseQueryParams).toHaveBeenCalled();
  });
});
