import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWatchlistPage } from "@/features/watchlist/api/get-watchlist-page";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("getWatchlistPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("uses defaults when params are omitted", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ rows: [] }),
    });

    await getWatchlistPage();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/watchlist?segment=all_holdings&sortBy=score_desc",
      { method: "GET", cache: "no-store" },
    );
  });

  it("includes user and custom query params", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ rows: [] }),
    });

    await getWatchlistPage({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      segment: "tech_growth",
      sortBy: "delta_desc",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/watchlist?segment=tech_growth&sortBy=delta_desc&userId=5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      { method: "GET", cache: "no-store" },
    );
  });
});
