// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  getHomeDashboard: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/features/home/api/get-home-dashboard", () => ({ getHomeDashboard: mocks.getHomeDashboard }));

import { useHomeDashboard } from "@/features/home/hooks/useHomeDashboard";

describe("useHomeDashboard", () => {
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
    renderHook(() => useHomeDashboard({ userId: null, includeWatchlist: true }));
    expect(mocks.useQuery.mock.calls[0][0].queryKey).toEqual(["home-dashboard", null, true]);

    renderHook(() => useHomeDashboard({ userId: "u-1", includeWatchlist: false }));
    expect(mocks.useQuery.mock.calls[1][0].queryKey).toEqual(["home-dashboard", "u-1", false]);
  });

  it("uses default and custom polling interval", () => {
    renderHook(() => useHomeDashboard());
    expect(mocks.useQuery.mock.calls[0][0].refetchInterval).toBe(15_000);

    renderHook(() => useHomeDashboard({ refetchInterval: 5_000 }));
    expect(mocks.useQuery.mock.calls[1][0].refetchInterval).toBe(5_000);
  });

  it("passes optional params to api client and respects enabled option", async () => {
    renderHook(() =>
      useHomeDashboard({
        userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
        includeWatchlist: false,
        enabled: false,
      }),
    );

    const options = mocks.useQuery.mock.calls[0][0];
    expect(options.enabled).toBe(false);
    await options.queryFn();
    expect(mocks.getHomeDashboard).toHaveBeenCalledWith({
      userId: "5b1578ce-f86a-4cab-960f-91f5f9498f7e",
      includeWatchlist: false,
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

    const { result } = renderHook(() => useHomeDashboard());
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
  });
});
