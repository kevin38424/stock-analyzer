import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTopStocksPage } from "@/features/stocks/api/get-top-stocks-page";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("getTopStocksPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("uses defaults when params are omitted", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ rows: [] }),
    });

    await getTopStocksPage();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/top-stocks?limit=25&offset=0&favoritesOnly=false&minScore=0&maxScore=100&sector=all&valuationStyle=growth",
      { method: "GET", cache: "no-store" },
    );
  });

  it("includes custom filters and userId", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ rows: [] }),
    });

    await getTopStocksPage({
      limit: 50,
      offset: 100,
      favoritesOnly: true,
      minScore: 85,
      maxScore: 100,
      sector: "Technology",
      valuationStyle: "value",
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/top-stocks?limit=50&offset=100&favoritesOnly=true&minScore=85&maxScore=100&sector=Technology&valuationStyle=value&userId=5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      { method: "GET", cache: "no-store" },
    );
  });
});
