import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchStocks } from "@/features/stocks/api/search-stocks";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("searchStocks", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("returns empty response for blank query", async () => {
    const out = await searchStocks("  ");
    expect(out.total).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls api and returns payload", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ total: 1 }),
    });
    await expect(searchStocks("AAPL")).resolves.toEqual({ total: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/search?q=AAPL&category=all&limit=25&includeTrending=true",
      { method: "GET", cache: "no-store" },
    );
  });

  it("throws when response is not ok", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "boom" }),
    });
    await expect(searchStocks("AAPL")).rejects.toThrow(/Unable to search/);
  });
});
