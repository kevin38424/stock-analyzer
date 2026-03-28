import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMockStockDetails } from "@/server/mock-stock-details";

describe("mock-stock-details", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for unknown ticker", () => {
    expect(getMockStockDetails("UNKNOWN", "1M")).toBeNull();
  });

  it("returns range-specific points", () => {
    const oneDay = getMockStockDetails("aapl", "1D");
    expect(oneDay?.pricePerformance.points).toHaveLength(1);

    const oneWeek = getMockStockDetails("AAPL", "1W");
    expect(oneWeek?.pricePerformance.points).toHaveLength(5);

    const oneMonth = getMockStockDetails("AAPL", "1M");
    const oneYear = getMockStockDetails("AAPL", "1Y");
    const all = getMockStockDetails("AAPL", "ALL");

    expect(oneMonth?.pricePerformance.points.length).toBeGreaterThan(5);
    expect(oneYear?.pricePerformance.points.length).toBe(oneMonth?.pricePerformance.points.length);
    expect(all?.meta.generatedAt).toBe("2026-03-28T12:00:00.000Z");
    expect(all?.meta.isMock).toBe(true);
  });
});
