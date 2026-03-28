import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/mock-data");
});

describe("getHomeDashboardData branch coverage", () => {
  it("covers quote fallback and signal normalization branches", async () => {
    vi.doMock("@/lib/mock-data", () => ({
      getMockTopStocks: () => [
        { ticker: "UNKNOWN", companyName: "Unknown", sector: "S", analysis: { total: 10, recommendation: "Avoid" } },
        { ticker: "TSLA", companyName: "Tesla", sector: "S", analysis: { total: 20, recommendation: "Strong Buy" } },
        { ticker: "META", companyName: "Meta", sector: "S", analysis: { total: 30, recommendation: "Buy" } },
        { ticker: "GOOGL", companyName: "Google", sector: "S", analysis: { total: 40, recommendation: "Watch" } },
        { ticker: "BRK.B", companyName: "Berkshire", sector: "S", analysis: { total: 50, recommendation: "Hold" } },
      ],
    }));

    const { getHomeDashboardData } = await import("@/server/home/get-home-dashboard-data");
    const out = getHomeDashboardData();

    expect(out.topStocks[0].price).toBe(0);
    const signals = out.watchlistPreview.map((r) => r.signal);
    expect(signals).toContain("Strong Buy");
    expect(signals).toContain("Buy");
    expect(signals).toContain("Watch");
    expect(signals).toContain("Hold");
  });

  it("covers empty score average branch", async () => {
    vi.doMock("@/lib/mock-data", () => ({
      getMockTopStocks: () => [],
    }));

    const { getHomeDashboardData } = await import("@/server/home/get-home-dashboard-data");
    const out = getHomeDashboardData();
    expect(out.kpis.averageScore).toBe(0);
    expect(out.topStocks).toEqual([]);
  });
});
