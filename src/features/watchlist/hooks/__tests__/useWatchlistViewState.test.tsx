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
  normalizeWatchlistViewQuery,
  useWatchlistViewState,
} from "@/features/watchlist/hooks/useWatchlistViewState";

describe("useWatchlistViewState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.usePathname.mockReturnValue("/watchlist");
  });

  it("normalizes invalid query values", () => {
    expect(
      normalizeWatchlistViewQuery({
        segment: "bad" as any,
        sortBy: "weird" as any,
      }),
    ).toEqual({
      segment: "all_holdings",
      sortBy: "score_desc",
    });
  });

  it("sets segment and syncs url", () => {
    const { result } = renderHook(() => useWatchlistViewState());

    act(() => {
      result.current.setSegment("tech_growth");
    });

    expect(result.current.queryState.segment).toBe("tech_growth");
    expect(mocks.replace).toHaveBeenCalledWith(
      "/watchlist?segment=tech_growth&sortBy=score_desc",
      { scroll: false },
    );
  });

  it("sets and cycles sort values", () => {
    const { result } = renderHook(() => useWatchlistViewState());

    act(() => {
      result.current.setSortBy("delta_desc");
    });
    expect(result.current.queryState.sortBy).toBe("delta_desc");

    act(() => {
      result.current.cycleSortBy(["delta_desc", "delta_asc"]);
    });
    expect(result.current.queryState.sortBy).toBe("delta_asc");
  });
});
