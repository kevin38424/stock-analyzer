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
  getEmptySearchResponse: vi.fn(() => ({ empty: true })),
  getSearchResultsLive: vi.fn(() => ({ result: true })),
}));

vi.mock("@/server/http/parsing", () => ({
  parseQueryParams: mocks.parseQueryParams,
  queryParamsWithDefaults: mocks.queryParamsWithDefaults,
}));
vi.mock("@/server/http/response", () => ({ badRequest: mocks.badRequest, ok: mocks.ok }));
vi.mock("@/server/http/request-context", () => ({ getRequestUserId: mocks.getRequestUserId }));
vi.mock("@/lib/search/get-search-results", () => ({ getEmptySearchResponse: mocks.getEmptySearchResponse }));
vi.mock("@/server/search/get-search-results-live", () => ({ getSearchResultsLive: mocks.getSearchResultsLive }));

import { GET } from "@/app/api/search/route";

describe("/api/search GET", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalid query", async () => {
    mocks.parseQueryParams.mockReturnValue(null);
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() } } as any)).resolves.toEqual({ kind: "bad", m: "Invalid query parameter." });
  });

  it("empty query", async () => {
    mocks.parseQueryParams.mockImplementation((request, _schema, mapper) => mapper((request as any).nextUrl.searchParams) as any);
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: { get: () => null } } as any)).resolves.toEqual({ kind: "ok", d: { empty: true } });
  });

  it("search results", async () => {
    mocks.parseQueryParams.mockImplementation((_request, _schema, _mapper) => ({
      q: "AAPL",
      category: "all",
      limit: 25,
      includeTrending: true,
      userId: null,
    }));
    await expect(
      GET({ nextUrl: { searchParams: new URLSearchParams("q=AAPL") }, headers: { get: () => null } } as any),
    ).resolves.toEqual({ kind: "ok", d: { result: true } });
    expect(mocks.getSearchResultsLive).toHaveBeenCalledWith({
      query: "AAPL",
      category: "all",
      limit: 25,
      includeTrending: true,
    });
  });
});
