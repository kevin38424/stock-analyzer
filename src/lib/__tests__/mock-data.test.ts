import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMockStockMetrics, getMockTopStocks, getMockTopStocksPageData } from "@/lib/mock-data";

describe("mock-data", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("finds stock metrics by ticker", () => {
    expect(getMockStockMetrics("AAPL")?.ticker).toBe("AAPL");
    expect(getMockStockMetrics("NONE")).toBeNull();
  });

  it("returns scored top stocks sorted descending", () => {
    const rows = getMockTopStocks();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].analysis.total).toBeGreaterThanOrEqual(rows[1].analysis.total);
  });

  it("filters top stock page query", () => {
    const payload = getMockTopStocksPageData({
      limit: 2,
      offset: 0,
      favoritesOnly: true,
      minScore: 90,
      maxScore: 100,
      sector: "Technology",
      valuationStyle: "growth",
      userId: null,
    });
    expect(payload.summary.generatedAt).toBe("2026-03-28T12:00:00.000Z");
    expect(payload.rows.every((r) => r.isFavorite)).toBe(true);
  });

  it("supports value/income styles and pagination", () => {
    const income = getMockTopStocksPageData({
      limit: 1,
      offset: 0,
      favoritesOnly: false,
      minScore: 0,
      maxScore: 100,
      sector: "all",
      valuationStyle: "income",
      userId: null,
    });
    expect(income.rows).toHaveLength(1);
    expect(typeof income.page.hasMore).toBe("boolean");

    const value = getMockTopStocksPageData({
      limit: 1,
      offset: 0,
      favoritesOnly: false,
      minScore: 0,
      maxScore: 100,
      sector: "all",
      valuationStyle: "value",
      userId: null,
    });
    expect(value.summary.title).toBe("Top Stocks");
  });

  it("covers sector/style edge cases", () => {
    const healthcareGrowth = getMockTopStocksPageData({
      limit: 10,
      offset: 0,
      favoritesOnly: false,
      minScore: 0,
      maxScore: 100,
      sector: "all",
      valuationStyle: "growth",
      userId: null,
    });
    expect(healthcareGrowth.rows.some((r) => r.sector === "Healthcare")).toBe(true);

    const noRows = getMockTopStocksPageData({
      limit: 10,
      offset: 0,
      favoritesOnly: false,
      minScore: 99,
      maxScore: 100,
      sector: "Energy",
      valuationStyle: "growth",
      userId: null,
    });
    expect(noRows.rows).toEqual([]);
    expect(noRows.featured.ticker).toBe("NVDA");

    const sectorMatch = getMockTopStocksPageData({
      limit: 10,
      offset: 0,
      favoritesOnly: false,
      minScore: 0,
      maxScore: 100,
      sector: "technology",
      valuationStyle: "value",
      userId: null,
    });
    expect(sectorMatch.rows.every((r) => r.sector.toLowerCase() === "technology")).toBe(true);
  });
});
