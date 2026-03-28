// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  addStockToWatchlist: vi.fn(),
  removeStockFromWatchlist: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}));
vi.mock("@/features/stocks/api/mutate-stock-watchlist", () => ({
  addStockToWatchlist: mocks.addStockToWatchlist,
  removeStockFromWatchlist: mocks.removeStockFromWatchlist,
}));

import { useStockWatchlistActions } from "@/features/stocks/hooks/useStockWatchlistActions";

describe("useStockWatchlistActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQueryClient.mockReturnValue({ invalidateQueries: mocks.invalidateQueries });
    mocks.useMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    });
  });

  it("exposes add/remove helpers from mutation hooks", () => {
    const { result } = renderHook(() => useStockWatchlistActions());
    expect(typeof result.current.addToWatchlist).toBe("function");
    expect(typeof result.current.removeFromWatchlist).toBe("function");
    expect(mocks.useMutation).toHaveBeenCalledTimes(2);
  });

  it("invalidates dependent queries on add success", async () => {
    const addConfig = { onSuccess: undefined as ((d: unknown, v: { ticker: string }) => void) | undefined };
    const removeConfig = { onSuccess: undefined as ((d: unknown, v: { ticker: string }) => void) | undefined };

    mocks.useMutation
      .mockImplementationOnce((config) => {
        addConfig.onSuccess = config.onSuccess;
        return { mutateAsync: vi.fn(), isPending: false, error: null };
      })
      .mockImplementationOnce((config) => {
        removeConfig.onSuccess = config.onSuccess;
        return { mutateAsync: vi.fn(), isPending: false, error: null };
      });

    renderHook(() => useStockWatchlistActions());

    addConfig.onSuccess?.({}, { ticker: "aapl" });

    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["watchlist-page"] });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["stock-details", "AAPL"] });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["top-stocks-page"] });

    removeConfig.onSuccess?.({}, { ticker: "msft" });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["stock-details", "MSFT"] });
  });
});
