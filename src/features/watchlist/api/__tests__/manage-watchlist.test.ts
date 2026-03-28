import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWatchlistItem,
  deleteWatchlistItem,
  patchWatchlistItem,
} from "@/features/watchlist/api/manage-watchlist";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

describe("watchlist mutation api", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("sends POST for create", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true }),
    });

    await createWatchlistItem({
      userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0",
      ticker: "AAPL",
      segment: "tech_growth",
      thesis: "AI tailwinds",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/watchlist",
      {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0",
          ticker: "AAPL",
          companyId: undefined,
          segment: "tech_growth",
          thesis: "AI tailwinds",
        }),
      },
    );
  });

  it("sends PATCH for update", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true }),
    });

    await patchWatchlistItem({
      userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0",
      companyId: "4f72e2cc-b028-4d6c-bb67-e4e99271fd0b",
      thesis: "Updated thesis",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/watchlist",
      {
        method: "PATCH",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0",
          ticker: undefined,
          companyId: "4f72e2cc-b028-4d6c-bb67-e4e99271fd0b",
          segment: undefined,
          thesis: "Updated thesis",
        }),
      },
    );
  });

  it("sends DELETE for remove", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true }),
    });

    await deleteWatchlistItem({
      userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0",
      ticker: "NVDA",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/watchlist",
      {
        method: "DELETE",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "8c11f4ee-7dae-4675-aea7-63942f0665d0",
          ticker: "NVDA",
          companyId: undefined,
        }),
      },
    );
  });
});
