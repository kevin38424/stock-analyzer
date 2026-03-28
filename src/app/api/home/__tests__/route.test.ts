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
  getHomeDashboardDataLive: vi.fn(),
}));

vi.mock("@/server/http/parsing", () => ({
  parseQueryParams: mocks.parseQueryParams,
  queryParamsWithDefaults: mocks.queryParamsWithDefaults,
}));
vi.mock("@/server/http/response", () => ({ badRequest: mocks.badRequest, ok: mocks.ok }));
vi.mock("@/server/http/request-context", () => ({ getRequestUserId: mocks.getRequestUserId }));
vi.mock("@/server/home/get-home-dashboard-data-live", () => ({ getHomeDashboardDataLive: mocks.getHomeDashboardDataLive }));

import { GET } from "@/app/api/home/route";

describe("/api/home GET", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalid query", async () => {
    mocks.parseQueryParams.mockReturnValue(null);
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves.toEqual({ kind: "bad", m: "Invalid query parameters." });
  });

  it("returns data", async () => {
    mocks.parseQueryParams.mockImplementation((request, _schema, mapper) => mapper((request as any).nextUrl.searchParams) as any);
    mocks.getHomeDashboardDataLive.mockResolvedValue({ a: 1 });
    await expect(GET({ nextUrl: { searchParams: new URLSearchParams("includeWatchlist=true") }, headers: new Headers() } as any)).resolves.toEqual({ kind: "ok", d: { a: 1 } });

    await GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any);
    expect(mocks.getHomeDashboardDataLive).toHaveBeenCalledWith({ includeWatchlist: "true", userId: null });
  });
});
