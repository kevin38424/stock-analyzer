// @vitest-environment jsdom
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useWatchlistPagination } from "@/features/watchlist/hooks/useWatchlistPagination";

const rows = [
  {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    sector: "Consumer Tech",
    segment: "all_holdings",
    score: 90,
    deltaScore: 2,
    price: 100,
    changePercent: 1,
    recommendation: "BUY",
    thesis: "Strong moat",
  },
  {
    ticker: "MSFT",
    companyName: "Microsoft Corp.",
    sector: "Enterprise Software",
    segment: "all_holdings",
    score: 88,
    deltaScore: 1,
    price: 120,
    changePercent: 0.5,
    recommendation: "BUY",
    thesis: "Cloud momentum",
  },
  {
    ticker: "NVDA",
    companyName: "NVIDIA Corp.",
    sector: "Semiconductors",
    segment: "all_holdings",
    score: 95,
    deltaScore: 3,
    price: 130,
    changePercent: 2,
    recommendation: "STRONG BUY",
    thesis: "AI demand",
  },
] as const;

describe("useWatchlistPagination", () => {
  it("paginates and navigates rows", () => {
    const { result } = renderHook(() =>
      useWatchlistPagination({ rows: [...rows], totalTracked: 10, pageSize: 2, resetKey: "a" }),
    );

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.pagedRows).toHaveLength(2);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.pagedRows).toHaveLength(1);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("resets page when resetKey changes", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => useWatchlistPagination({ rows: [...rows], pageSize: 2, resetKey }),
      {
        initialProps: { resetKey: "a" },
      },
    );

    act(() => {
      result.current.nextPage();
    });
    expect(result.current.currentPage).toBe(2);

    rerender({ resetKey: "b" });

    expect(result.current.currentPage).toBe(1);
  });
});
