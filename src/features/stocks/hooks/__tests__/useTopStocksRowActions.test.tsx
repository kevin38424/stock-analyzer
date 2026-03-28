// @vitest-environment jsdom
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  addToWatchlist: vi.fn(),
  removeFromWatchlist: vi.fn(),
}));

vi.mock("@/features/stocks/hooks/useStockWatchlistActions", () => ({
  useStockWatchlistActions: () => ({
    addToWatchlist: mocks.addToWatchlist,
    removeFromWatchlist: mocks.removeFromWatchlist,
  }),
}));

import { useTopStocksRowActions } from "@/features/stocks/hooks/useTopStocksRowActions";

const rows = [
  {
    rank: 1,
    ticker: "MSFT",
    companyName: "Microsoft Corp.",
    sector: "Technology",
    industry: "Software",
    score: 94,
    recommendation: "BUY" as const,
    price: 415.5,
    changePercent: 1.12,
    isFavorite: false,
  },
];

describe("useTopStocksRowActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addToWatchlist.mockResolvedValue({ success: true });
    mocks.removeFromWatchlist.mockResolvedValue({ success: true });
  });

  it("toggles local favorite without userId", async () => {
    const { result } = renderHook(() => useTopStocksRowActions({ rows, userId: null }));

    await act(async () => {
      await result.current.toggleFavorite(rows[0]);
    });

    expect(result.current.getRowFavorite(rows[0])).toBe(true);
    expect(mocks.addToWatchlist).not.toHaveBeenCalled();
    expect(result.current.feedbackMessage).toMatch(/local favorites/);
  });

  it("persists watchlist changes when userId exists", async () => {
    const { result } = renderHook(() =>
      useTopStocksRowActions({ rows, userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e" }),
    );

    await act(async () => {
      await result.current.toggleFavorite(rows[0]);
    });

    expect(mocks.addToWatchlist).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      ticker: "MSFT",
      segment: "all_holdings",
    });
    expect(result.current.getRowFavorite(rows[0])).toBe(true);

    const likedRow = { ...rows[0], isFavorite: true };

    await act(async () => {
      await result.current.toggleFavorite(likedRow);
    });

    expect(mocks.removeFromWatchlist).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      ticker: "MSFT",
    });
  });

  it("supports row menu and copy action", async () => {
    const { result } = renderHook(() => useTopStocksRowActions({ rows, userId: null }));

    act(() => {
      result.current.toggleRowMenu("msft");
    });
    expect(result.current.activeMenuTicker).toBe("MSFT");

    await act(async () => {
      await result.current.copyTicker("msft");
    });
    expect(result.current.feedbackMessage).toBe("MSFT copied.");

    act(() => {
      result.current.closeRowMenu();
      result.current.clearFeedback();
    });

    expect(result.current.activeMenuTicker).toBe(null);
    expect(result.current.feedbackMessage).toBe(null);
  });
});
