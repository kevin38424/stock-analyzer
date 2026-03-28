// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  getStockDetails: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mocks.useQuery,
  useQueryClient: mocks.useQueryClient,
}));
vi.mock("@/features/stocks/api/get-stock-details", () => ({ getStockDetails: mocks.getStockDetails }));

import { useStockDetails } from "@/features/stocks/hooks/useStockDetails";

describe("useStockDetails", () => {
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

  it("uses ticker/range in query key", () => {
    renderHook(() => useStockDetails({ ticker: "aapl", range: "1W" }));
    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual(["stock-details", "AAPL", "1W"]);
  });

  it("uses default polling and supports custom interval", () => {
    renderHook(() => useStockDetails({ ticker: "AAPL" }));
    expect(mocks.useQuery.mock.calls[0][0].refetchInterval).toBe(15_000);

    renderHook(() => useStockDetails({ ticker: "AAPL", refetchInterval: 5_000 }));
    expect(mocks.useQuery.mock.calls[1][0].refetchInterval).toBe(5_000);
  });

  it("passes params to api client and respects enabled", async () => {
    renderHook(() => useStockDetails({ ticker: "aapl", range: "ALL", enabled: false }));
    const options = mocks.useQuery.mock.calls[0][0];
    expect(options.enabled).toBe(false);
    await options.queryFn();
    expect(mocks.getStockDetails).toHaveBeenCalledWith({
      ticker: "AAPL",
      range: "ALL",
    });
  });

  it("invalidates details query when quote event contains ticker", () => {
    renderHook(() => useStockDetails({ ticker: "AAPL", range: "1M", enableLiveInvalidation: true }));

    window.dispatchEvent(
      new CustomEvent("market:quotes-updated", {
        detail: { tickers: ["AAPL"], source: "manual" },
      }),
    );

    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["stock-details", "AAPL"],
    });
  });
});
