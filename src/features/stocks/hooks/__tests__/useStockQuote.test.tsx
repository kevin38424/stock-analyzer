// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  getStockQuote: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/features/stocks/api/get-stock-quote", () => ({ getStockQuote: mocks.getStockQuote }));

import { useStockQuote } from "@/features/stocks/hooks/useStockQuote";

describe("useStockQuote", () => {
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

  it("uses stable query key with ticker and maxAgeSeconds", () => {
    renderHook(() => useStockQuote({ ticker: "aapl", maxAgeSeconds: 30 }));
    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual(["stock-quote", "AAPL", 30]);
  });

  it("uses default polling interval and supports custom interval", () => {
    renderHook(() => useStockQuote({ ticker: "AAPL" }));
    expect(mocks.useQuery.mock.calls[0][0].refetchInterval).toBe(10_000);

    renderHook(() => useStockQuote({ ticker: "AAPL", refetchInterval: 2_500 }));
    expect(mocks.useQuery.mock.calls[1][0].refetchInterval).toBe(2_500);
  });

  it("passes normalized ticker to api and respects enabled option", async () => {
    renderHook(() => useStockQuote({ ticker: "msft", enabled: false, maxAgeSeconds: 45 }));
    const options = mocks.useQuery.mock.calls[0][0];
    expect(options.enabled).toBe(false);
    await options.queryFn();
    expect(mocks.getStockQuote).toHaveBeenCalledWith({ ticker: "MSFT", maxAgeSeconds: 45 });
  });
});
