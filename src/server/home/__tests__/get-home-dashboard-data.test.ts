import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHomeDashboardData } from "@/server/home/get-home-dashboard-data";

describe("getHomeDashboardData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns deterministic payload shape", () => {
    const data = getHomeDashboardData();
    expect(data.generatedAt).toBe("2026-03-28T12:00:00.000Z");
    expect(data.topStocks).toHaveLength(3);
    expect(data.watchlistPreview).toHaveLength(4);
    expect(data.scoreDistribution).toHaveLength(10);
    expect(data.kpis.stocksAnalyzed).toBe(8492);
  });
});
