// @vitest-environment jsdom
import React from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { buildWatchlistCsv, useWatchlistExport } from "@/features/watchlist/hooks/useWatchlistExport";

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
] as const;

describe("useWatchlistExport", () => {
  it("builds csv with header and row values", () => {
    const csv = buildWatchlistCsv([...rows]);

    expect(csv).toContain('"Ticker"');
    expect(csv).toContain('"AAPL"');
    expect(csv).toContain('"100.00"');
  });

  it("returns filename and csv when exporting", () => {
    const createObjectUrl = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    const { result } = renderHook(() => useWatchlistExport());
    const output = result.current.exportRows([...rows]);

    expect(output.filename).toMatch(/^watchlist-/);
    expect(output.csv).toContain('"AAPL"');
    expect(createObjectUrl).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalled();

    createObjectUrl.mockRestore();
    revokeObjectUrl.mockRestore();
  });
});
