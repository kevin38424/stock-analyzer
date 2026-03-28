// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  getStockWatchlistStatus: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/features/stocks/api/get-stock-watchlist-status", () => ({
  getStockWatchlistStatus: mocks.getStockWatchlistStatus,
}));

import { useStockWatchlistStatus } from "@/features/stocks/hooks/useStockWatchlistStatus";

describe("useStockWatchlistStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    });
  });

  it("uses stable query key", () => {
    renderHook(() =>
      useStockWatchlistStatus({
        ticker: "aapl",
        userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      }),
    );

    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual([
      "stock-watchlist-status",
      "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      "AAPL",
    ]);
  });

  it("passes options to API and supports polling overrides", async () => {
    renderHook(() =>
      useStockWatchlistStatus({
        ticker: "msft",
        userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
        refetchInterval: 10_000,
      }),
    );
    expect(mocks.useQuery.mock.calls[0][0].refetchInterval).toBe(10_000);
    await mocks.useQuery.mock.calls[0][0].queryFn();
    expect(mocks.getStockWatchlistStatus).toHaveBeenCalledWith({
      ticker: "MSFT",
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
    });
  });
});
