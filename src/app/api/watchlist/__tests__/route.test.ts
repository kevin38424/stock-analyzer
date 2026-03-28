import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  parseJsonBody: vi.fn(),
  parseQueryParams: vi.fn(),
  queryParamsWithDefaults: vi.fn((params: URLSearchParams, defaults: Record<string, string | undefined>) =>
    Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [key, params.get(key) ?? value]),
    ),
  ),
  parseWithSchema: vi.fn(),
  badRequest: vi.fn((m: string) => ({ kind: "bad", m })),
  notFound: vi.fn((m: string) => ({ kind: "nf", m })),
  ok: vi.fn((d: unknown, s?: number) => ({ kind: "ok", d, s })),
  serverError: vi.fn((m: string) => ({ kind: "err", m })),
  getRequestUserId: vi.fn(() => null),
  fetchWatchlistPageData: vi.fn(),
  createOrUpdateWatchlistItem: vi.fn(),
  patchWatchlistItem: vi.fn(),
  removeWatchlistItem: vi.fn(),
}));

vi.mock("@/server/http/parsing", () => ({
  parseJsonBody: mocks.parseJsonBody,
  parseQueryParams: mocks.parseQueryParams,
  queryParamsWithDefaults: mocks.queryParamsWithDefaults,
  parseWithSchema: mocks.parseWithSchema,
}));
vi.mock("@/server/http/response", () => ({
  badRequest: mocks.badRequest,
  notFound: mocks.notFound,
  ok: mocks.ok,
  serverError: mocks.serverError,
}));
vi.mock("@/server/http/request-context", () => ({ getRequestUserId: mocks.getRequestUserId }));
vi.mock("@/server/watchlist/watchlist-service", () => ({
  fetchWatchlistPageData: mocks.fetchWatchlistPageData,
  createOrUpdateWatchlistItem: mocks.createOrUpdateWatchlistItem,
  patchWatchlistItem: mocks.patchWatchlistItem,
  removeWatchlistItem: mocks.removeWatchlistItem,
}));

import { DELETE, GET, PATCH, POST } from "@/app/api/watchlist/route";

describe("/api/watchlist", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET returns bad request when query is invalid", async () => {
    mocks.parseQueryParams.mockReturnValue(null);

    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves
      .toEqual({ kind: "bad", m: "Invalid watchlist query parameters." });
  });

  it("GET returns payload from service", async () => {
    mocks.parseQueryParams.mockReturnValue({ userId: "u", segment: "all_holdings", sortBy: "score_desc" });
    mocks.fetchWatchlistPageData.mockResolvedValue({ rows: [] });

    await expect(GET({ nextUrl: { searchParams: new URLSearchParams() }, headers: new Headers() } as any)).resolves
      .toEqual({ kind: "ok", d: { rows: [] }, s: undefined });
  });

  it("POST handles body validation and maps service result", async () => {
    mocks.parseJsonBody.mockResolvedValueOnce(null);
    await expect(POST({} as any)).resolves.toEqual({ kind: "bad", m: "Invalid JSON body." });

    mocks.parseJsonBody.mockResolvedValueOnce({});
    mocks.parseWithSchema.mockReturnValueOnce(null);
    await expect(POST({} as any)).resolves.toEqual({ kind: "bad", m: "Invalid watchlist payload." });

    mocks.parseJsonBody.mockResolvedValue({});
    mocks.parseWithSchema.mockReturnValue({ userId: "u", ticker: "AAPL", segment: "all_holdings" });

    mocks.createOrUpdateWatchlistItem.mockResolvedValueOnce({ kind: "not_found", message: "missing" });
    await expect(POST({} as any)).resolves.toEqual({ kind: "nf", m: "missing" });

    mocks.createOrUpdateWatchlistItem.mockResolvedValueOnce({ kind: "error", message: "boom" });
    await expect(POST({} as any)).resolves.toEqual({ kind: "err", m: "boom" });

    mocks.createOrUpdateWatchlistItem.mockResolvedValueOnce({ kind: "ok", data: { success: true }, status: 201 });
    await expect(POST({} as any)).resolves.toEqual({ kind: "ok", d: { success: true }, s: 201 });
  });

  it("PATCH handles body validation and maps service result", async () => {
    mocks.parseJsonBody.mockResolvedValueOnce(null);
    await expect(PATCH({} as any)).resolves.toEqual({ kind: "bad", m: "Invalid JSON body." });

    mocks.parseJsonBody.mockResolvedValueOnce({});
    mocks.parseWithSchema.mockReturnValueOnce(null);
    await expect(PATCH({} as any)).resolves.toEqual({ kind: "bad", m: "Invalid watchlist update payload." });

    mocks.parseJsonBody.mockResolvedValue({});
    mocks.parseWithSchema.mockReturnValue({ userId: "u", ticker: "AAPL", thesis: "t" });

    mocks.patchWatchlistItem.mockResolvedValueOnce({ kind: "not_found", message: "missing" });
    await expect(PATCH({} as any)).resolves.toEqual({ kind: "nf", m: "missing" });

    mocks.patchWatchlistItem.mockResolvedValueOnce({ kind: "error", message: "boom" });
    await expect(PATCH({} as any)).resolves.toEqual({ kind: "err", m: "boom" });

    mocks.patchWatchlistItem.mockResolvedValueOnce({ kind: "ok", data: { success: true } });
    await expect(PATCH({} as any)).resolves.toEqual({ kind: "ok", d: { success: true }, s: undefined });
  });

  it("DELETE handles body validation and maps service result", async () => {
    mocks.parseJsonBody.mockResolvedValueOnce(null);
    await expect(DELETE({} as any)).resolves.toEqual({ kind: "bad", m: "Invalid JSON body." });

    mocks.parseJsonBody.mockResolvedValueOnce({});
    mocks.parseWithSchema.mockReturnValueOnce(null);
    await expect(DELETE({} as any)).resolves.toEqual({ kind: "bad", m: "Invalid watchlist delete payload." });

    mocks.parseJsonBody.mockResolvedValue({});
    mocks.parseWithSchema.mockReturnValue({ userId: "u", ticker: "AAPL" });

    mocks.removeWatchlistItem.mockResolvedValueOnce({ kind: "not_found", message: "missing" });
    await expect(DELETE({} as any)).resolves.toEqual({ kind: "nf", m: "missing" });

    mocks.removeWatchlistItem.mockResolvedValueOnce({ kind: "error", message: "boom" });
    await expect(DELETE({} as any)).resolves.toEqual({ kind: "err", m: "boom" });

    mocks.removeWatchlistItem.mockResolvedValueOnce({ kind: "ok", data: { success: true } });
    await expect(DELETE({} as any)).resolves.toEqual({ kind: "ok", d: { success: true }, s: undefined });
  });
});
