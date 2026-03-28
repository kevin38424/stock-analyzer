// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  searchStocks: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/features/stocks/api/search-stocks", () => ({ searchStocks: mocks.searchStocks }));

import { useStockSearch } from "@/features/stocks/hooks/useStockSearch";

describe("useStockSearch", () => {
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

  it("uses normalized query key and default enabled behavior", () => {
    renderHook(() => useStockSearch({ query: "  AAPL  " }));
    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual(["stock-search", "AAPL"]);
    expect(mocks.useQuery.mock.calls[0][0].enabled).toBe(true);

    renderHook(() => useStockSearch({ query: "   " }));
    expect(mocks.useQuery.mock.calls[1][0].enabled).toBe(false);
  });

  it("passes query to api client and supports explicit enabled/refetchInterval", async () => {
    renderHook(() => useStockSearch({ query: "MSFT", enabled: true, refetchInterval: 5_000 }));

    const options = mocks.useQuery.mock.calls[0][0];
    expect(options.refetchInterval).toBe(5_000);
    await options.queryFn();
    expect(mocks.searchStocks).toHaveBeenCalledWith("MSFT");
  });
});
