// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  getSearchResults: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/features/stocks/api/get-search-results", () => ({
  getSearchResults: mocks.getSearchResults,
}));

import { useSearchResults } from "@/features/stocks/hooks/useSearchResults";

describe("useSearchResults", () => {
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

  it("uses stable query key with defaults", () => {
    renderHook(() => useSearchResults({ q: " nvda " }));
    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual([
      "search-results",
      {
        q: "nvda",
        category: "all",
        limit: 25,
        includeTrending: true,
        userId: null,
      },
    ]);
  });

  it("passes params to api client and supports disabled mode", async () => {
    renderHook(() =>
      useSearchResults({
        q: "AAPL",
        category: "stocks",
        limit: 10,
        includeTrending: false,
        userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
        enabled: false,
      }),
    );

    const options = mocks.useQuery.mock.calls[0][0];
    expect(options.enabled).toBe(false);
    await options.queryFn();
    expect(mocks.getSearchResults).toHaveBeenCalledWith({
      q: "AAPL",
      category: "stocks",
      limit: 10,
      includeTrending: false,
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
    });
  });

  it("disables by default for blank query", () => {
    renderHook(() => useSearchResults({ q: "   " }));
    expect(mocks.useQuery.mock.calls[0][0].enabled).toBe(false);
  });
});
