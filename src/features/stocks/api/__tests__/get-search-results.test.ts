import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSearchResults } from "@/features/stocks/api/get-search-results";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("getSearchResults", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("calls api with expected query params", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ query: "AAPL", results: [] }),
    });

    await expect(getSearchResults({ q: "AAPL", category: "stocks", limit: 10, includeTrending: false })).resolves.toEqual({
      query: "AAPL",
      results: [],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/search?q=AAPL&category=stocks&limit=10&includeTrending=false",
      { method: "GET", cache: "no-store" },
    );
  });
});
