// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  getTopStocksPage: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/features/stocks/api/get-top-stocks-page", () => ({
  getTopStocksPage: mocks.getTopStocksPage,
}));

import { useTopStocksPage } from "@/features/stocks/hooks/useTopStocksPage";

describe("useTopStocksPage", () => {
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

  it("uses stable query key permutations", () => {
    renderHook(() => useTopStocksPage({ limit: 25, offset: 0, sector: "all", valuationStyle: "growth" }));
    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual([
      "top-stocks-page",
      {
        userId: null,
        limit: 25,
        offset: 0,
        favoritesOnly: false,
        minScore: 0,
        maxScore: 100,
        sector: "all",
        valuationStyle: "growth",
      },
    ]);
  });

  it("uses default and custom polling interval", () => {
    renderHook(() => useTopStocksPage());
    expect(mocks.useQuery.mock.calls[0][0].refetchInterval).toBe(15_000);

    renderHook(() => useTopStocksPage({ refetchInterval: 5_000 }));
    expect(mocks.useQuery.mock.calls[1][0].refetchInterval).toBe(5_000);
  });

  it("passes params to api client and respects enabled option", async () => {
    renderHook(() =>
      useTopStocksPage({
        userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
        limit: 50,
        favoritesOnly: true,
        enabled: false,
      }),
    );

    const options = mocks.useQuery.mock.calls[0][0];
    expect(options.enabled).toBe(false);
    await options.queryFn();
    expect(mocks.getTopStocksPage).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      limit: 50,
      favoritesOnly: true,
      enabled: false,
    });
  });

  it("returns error state from react-query", () => {
    const error = new Error("bad");
    mocks.useQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error,
      refetch: mocks.refetch,
    });

    const { result } = renderHook(() => useTopStocksPage());
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });
});
