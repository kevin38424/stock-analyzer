// @vitest-environment jsdom
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTopStocksRealtimeQuotes } from "@/features/stocks/hooks/useTopStocksRealtimeQuotes";

const rows = [
  {
    rank: 1,
    ticker: "MSFT",
    companyName: "Microsoft Corp.",
    sector: "Technology",
    industry: "Software",
    score: 94,
    recommendation: "BUY" as const,
    price: 415.5,
    changePercent: 1.12,
    isFavorite: false,
  },
];

describe("useTopStocksRealtimeQuotes", () => {
  it("applies patch updates and can clear patches", () => {
    const { result } = renderHook(() => useTopStocksRealtimeQuotes(rows));

    expect(result.current.rowsWithRealtimeQuotes[0].price).toBe(415.5);

    act(() => {
      result.current.applyQuotePatch({ ticker: "msft", price: 420.01, changePercent: 2.02 });
    });

    expect(result.current.hasQuotePatches).toBe(true);
    expect(result.current.rowsWithRealtimeQuotes[0].price).toBe(420.01);
    expect(result.current.rowsWithRealtimeQuotes[0].changePercent).toBe(2.02);

    act(() => {
      result.current.clearQuotePatches();
    });

    expect(result.current.hasQuotePatches).toBe(false);
    expect(result.current.rowsWithRealtimeQuotes[0].price).toBe(415.5);
  });

  it("ignores blank ticker patches", () => {
    const { result } = renderHook(() => useTopStocksRealtimeQuotes(rows));

    act(() => {
      result.current.applyQuotePatch({ ticker: "   ", price: 999 });
    });

    expect(result.current.hasQuotePatches).toBe(false);
    expect(result.current.rowsWithRealtimeQuotes[0].price).toBe(415.5);
  });
});
