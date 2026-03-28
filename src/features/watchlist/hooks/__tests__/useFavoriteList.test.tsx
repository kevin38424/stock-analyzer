// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useWatchlistPage: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@/features/watchlist/hooks/useWatchlistPage", () => ({
  useWatchlistPage: mocks.useWatchlistPage,
}));

import { useFavoriteList } from "@/features/watchlist/hooks/useFavoriteList";

describe("useFavoriteList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useWatchlistPage.mockReturnValue({
      data: {
        rows: [
          { ticker: "NVDA", score: 94 },
          { ticker: "AAPL", score: 78 },
          { ticker: "PLTR", score: 82 },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    });
  });

  it("maps top rows to favorite items", () => {
    const { result } = renderHook(() => useFavoriteList({ limit: 2 }));

    expect(mocks.useWatchlistPage).toHaveBeenCalledWith({
      segment: "all_holdings",
      sortBy: "score_desc",
      enabled: undefined,
      refetchInterval: undefined,
    });
    expect(result.current.favorites).toEqual([
      { ticker: "NVDA", score: 94 },
      { ticker: "AAPL", score: 78 },
    ]);
  });

  it("falls back to static favorites when watchlist rows are empty", () => {
    mocks.useWatchlistPage.mockReturnValueOnce({
      data: { rows: [] },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    });

    const { result } = renderHook(() => useFavoriteList({ limit: 2 }));

    expect(result.current.favorites).toEqual([
      { ticker: "GOOGL", score: 80.22 },
      { ticker: "MSFT", score: 72.34 },
    ]);
  });
});
