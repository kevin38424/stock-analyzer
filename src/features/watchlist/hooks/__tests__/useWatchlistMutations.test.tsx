// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  createWatchlistItem: vi.fn(),
  patchWatchlistItem: vi.fn(),
  deleteWatchlistItem: vi.fn(),
  invalidateQueries: vi.fn(),
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  reset: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}));
vi.mock("@/features/watchlist/api/manage-watchlist", () => ({
  createWatchlistItem: mocks.createWatchlistItem,
  patchWatchlistItem: mocks.patchWatchlistItem,
  deleteWatchlistItem: mocks.deleteWatchlistItem,
}));

import {
  useCreateWatchlistItem,
  useDeleteWatchlistItem,
  usePatchWatchlistItem,
} from "@/features/watchlist/hooks/useWatchlistMutations";

describe("watchlist mutation hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQueryClient.mockReturnValue({ invalidateQueries: mocks.invalidateQueries });
    mocks.useMutation.mockReturnValue({
      mutate: mocks.mutate,
      mutateAsync: mocks.mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: mocks.reset,
    });
  });

  it("create hook invalidates watchlist query and calls api", async () => {
    renderHook(() => useCreateWatchlistItem("5b1578ce-f86a-4cab-960f-91f5f9498f7e"));

    const config = mocks.useMutation.mock.calls[0][0];
    await config.mutationFn({ ticker: "AAPL", segment: "tech_growth" });
    await config.onSuccess();

    expect(mocks.createWatchlistItem).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      ticker: "AAPL",
      segment: "tech_growth",
    });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["watchlist-page"] });
  });

  it("patch hook throws when userId is missing", async () => {
    renderHook(() => usePatchWatchlistItem(null));
    const config = mocks.useMutation.mock.calls[0][0];

    await expect(config.mutationFn({ ticker: "AAPL", thesis: "x" })).rejects.toThrow(
      "A valid userId is required to update a watchlist item.",
    );
  });

  it("delete hook calls api with userId", async () => {
    renderHook(() => useDeleteWatchlistItem("5b1578ce-f86a-4cab-960f-91f5f9498f7e"));
    const config = mocks.useMutation.mock.calls[0][0];

    await config.mutationFn({ ticker: "NVDA" });

    expect(mocks.deleteWatchlistItem).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      ticker: "NVDA",
    });
  });
});
