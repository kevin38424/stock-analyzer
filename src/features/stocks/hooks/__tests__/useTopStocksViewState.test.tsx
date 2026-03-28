// @vitest-environment jsdom
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => mocks.usePathname(),
}));

import {
  normalizeTopStocksQueryState,
  useTopStocksViewState,
} from "@/features/stocks/hooks/useTopStocksViewState";

describe("useTopStocksViewState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePathname.mockReturnValue("/top-stocks");
  });

  it("normalizes initial query bounds", () => {
    expect(
      normalizeTopStocksQueryState({
        minScore: 110,
        maxScore: 10,
        limit: 999,
        offset: -4,
      }),
    ).toMatchObject({
      minScore: 10,
      maxScore: 100,
      limit: 100,
      offset: 0,
    });
  });

  it("applies filters, resets pagination, and syncs url", () => {
    const { result } = renderHook(() => useTopStocksViewState());

    act(() => {
      result.current.setDraftFilters((prev) => ({
        ...prev,
        favoritesOnly: true,
        minScore: 90,
        maxScore: 95,
        sector: "Technology",
        valuationStyle: "value",
      }));
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.queryState).toMatchObject({
      favoritesOnly: true,
      minScore: 90,
      maxScore: 95,
      sector: "Technology",
      valuationStyle: "value",
      limit: 50,
      offset: 0,
    });

    expect(mocks.replace).toHaveBeenCalledWith(
      "/top-stocks?limit=50&offset=0&favoritesOnly=true&minScore=90&maxScore=95&sector=Technology&valuationStyle=value",
      { scroll: false },
    );
  });

  it("loads next page only when more data is available", () => {
    const { result } = renderHook(() => useTopStocksViewState());

    act(() => {
      result.current.loadNext(false);
    });
    expect(result.current.queryState.limit).toBe(50);

    act(() => {
      result.current.loadNext(true);
    });
    expect(result.current.queryState.limit).toBe(100);
    expect(mocks.replace).toHaveBeenCalledTimes(1);
  });

  it("cycles sectors in order", () => {
    const { result } = renderHook(() => useTopStocksViewState());

    act(() => {
      result.current.cycleSector(["all", "Technology", "Healthcare"]);
    });
    expect(result.current.draftFilters.sector).toBe("Technology");

    act(() => {
      result.current.cycleSector(["all", "Technology", "Healthcare"]);
    });
    expect(result.current.draftFilters.sector).toBe("Healthcare");
  });
});
