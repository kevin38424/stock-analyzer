// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  getWatchlistPage: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery, useQueryClient: mocks.useQueryClient }));
vi.mock("@/features/watchlist/api/get-watchlist-page", () => ({ getWatchlistPage: mocks.getWatchlistPage }));

import { useWatchlistPage } from "@/features/watchlist/hooks/useWatchlistPage";

describe("useWatchlistPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQueryClient.mockReturnValue({ invalidateQueries: mocks.invalidateQueries });
    mocks.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    });
  });

  it("uses stable query key permutations", () => {
    renderHook(() => useWatchlistPage({ userId: null, segment: "all_holdings", sortBy: "score_desc" }));
    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual([
      "watchlist-page",
      { userId: null, segment: "all_holdings", sortBy: "score_desc" },
    ]);

    renderHook(() => useWatchlistPage({ userId: "u-1", segment: "tech_growth", sortBy: "delta_desc" }));
    expect(mocks.useQuery.mock.calls[1][0].queryKey).toEqual([
      "watchlist-page",
      { userId: "u-1", segment: "tech_growth", sortBy: "delta_desc" },
    ]);
  });

  it("uses default and custom polling interval", () => {
    renderHook(() => useWatchlistPage());
    expect(mocks.useQuery.mock.calls[0][0].refetchInterval).toBe(15_000);

    renderHook(() => useWatchlistPage({ refetchInterval: 5_000 }));
    expect(mocks.useQuery.mock.calls[1][0].refetchInterval).toBe(5_000);
  });

  it("passes params to api client and respects enabled option", async () => {
    renderHook(() =>
      useWatchlistPage({
        userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
        segment: "speculative",
        sortBy: "price_asc",
        enabled: false,
      }),
    );

    const options = mocks.useQuery.mock.calls[0][0];
    expect(options.enabled).toBe(false);
    await options.queryFn();
    expect(mocks.getWatchlistPage).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      segment: "speculative",
      sortBy: "price_asc",
    });
  });

  it("invalidates watchlist queries when live quote event is fired", () => {
    renderHook(() => useWatchlistPage({ enableLiveInvalidation: true }));

    window.dispatchEvent(new CustomEvent("market:quotes-updated", { detail: { tickers: ["AAPL"] } }));

    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["watchlist-page"],
    });
  });
});
