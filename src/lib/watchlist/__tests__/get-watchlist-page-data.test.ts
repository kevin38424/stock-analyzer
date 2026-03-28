import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMockWatchlistPageData } from "@/lib/watchlist/get-watchlist-page-data";

const query = {
  userId: null,
  segment: "all_holdings",
  sortBy: "score_desc",
} as const;

describe("getMockWatchlistPageData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns ranked default rows", () => {
    const result = getMockWatchlistPageData({ ...query });
    expect(result.summary.generatedAt).toBe("2026-03-28T12:00:00.000Z");
    expect(result.rows[0].score).toBeGreaterThanOrEqual(result.rows[1].score);
    expect(result.totalTracked).toBe(4);
  });

  it("filters by segment and sort variants", () => {
    const tech = getMockWatchlistPageData({ ...query, segment: "tech_growth", sortBy: "price_asc" });
    expect(tech.rows.every((r) => r.segment === "tech_growth")).toBe(true);
    expect(tech.rows[0].price).toBeLessThanOrEqual(tech.rows[1].price);

    const byDelta = getMockWatchlistPageData({ ...query, segment: "all_holdings", sortBy: "delta_asc" });
    expect(byDelta.rows[0].deltaScore).toBeLessThanOrEqual(byDelta.rows[1].deltaScore);

    const scoreAsc = getMockWatchlistPageData({ ...query, segment: "all_holdings", sortBy: "score_asc" });
    expect(scoreAsc.rows[0].score).toBeLessThanOrEqual(scoreAsc.rows[1].score);

    const deltaDesc = getMockWatchlistPageData({ ...query, segment: "all_holdings", sortBy: "delta_desc" });
    expect(deltaDesc.rows[0].deltaScore).toBeGreaterThanOrEqual(deltaDesc.rows[1].deltaScore);

    const priceDesc = getMockWatchlistPageData({ ...query, segment: "all_holdings", sortBy: "price_desc" });
    expect(priceDesc.rows[0].price).toBeGreaterThanOrEqual(priceDesc.rows[1].price);
  });

  it("handles empty segment result", () => {
    const dividends = getMockWatchlistPageData({ ...query, segment: "dividends" });
    expect(dividends.rows).toEqual([]);
    expect(dividends.kpis.averageScore.value).toBe("0.0");
    expect(dividends.kpis.topPick.value).toBe("-");
  });
});
