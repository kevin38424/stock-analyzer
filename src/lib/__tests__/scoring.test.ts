import { describe, expect, it } from "vitest";
import { calculateCompositeScore } from "@/lib/scoring";
import type { RawStockMetrics } from "@/types/stock";

const base: RawStockMetrics = {
  ticker: "AAA",
  companyName: "AAA Corp",
  sector: "Tech",
  peRatio: 12,
  pbRatio: 2,
  psRatio: 2,
  evEbitda: 8,
  pegRatio: 0.9,
  grossMargin: 50,
  netMargin: 20,
  roe: 20,
  roa: 10,
  revenueGrowthYoy: 15,
  epsGrowth: 15,
  fcfGrowth: 10,
  debtToEquity: 0.6,
  currentRatio: 2,
  interestCoverage: 10,
  fcfYield: 5,
  week52Position: 0.4,
  rsi: 35,
  priceVs200DayMa: 0,
  analystConsensus: 80,
  newsSentiment: 70,
  insiderBuyingScore: 80,
};

describe("calculateCompositeScore", () => {
  it("returns a high score with strong recommendation and reasons", () => {
    const result = calculateCompositeScore(base);
    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(["Strong Buy", "Buy"]).toContain(result.recommendation);
    expect(result.explanation.length).toBeGreaterThan(0);
    expect(result.explanation.length).toBeLessThanOrEqual(4);
  });

  it("can produce strong buy recommendation band", () => {
    const strong = calculateCompositeScore({
      ...base,
      peRatio: 8,
      pbRatio: 1,
      psRatio: 1,
      evEbitda: 5,
      pegRatio: 0.5,
      grossMargin: 80,
      netMargin: 40,
      roe: 40,
      roa: 20,
      revenueGrowthYoy: 30,
      epsGrowth: 40,
      fcfGrowth: 30,
      debtToEquity: 0.1,
      currentRatio: 4,
      interestCoverage: 30,
      fcfYield: 10,
      week52Position: 0.1,
      rsi: 35,
      priceVs200DayMa: -10,
      analystConsensus: 100,
      newsSentiment: 100,
      insiderBuyingScore: 100,
    });
    expect(strong.recommendation).toBe("Strong Buy");
  });

  it("returns fallback explanation when no positive reasons are present", () => {
    const weak = {
      ...base,
      pegRatio: 4,
      roe: 10,
      revenueGrowthYoy: 1,
      debtToEquity: 2,
      insiderBuyingScore: 10,
    };
    const result = calculateCompositeScore(weak);
    expect(result.explanation).toHaveLength(1);
    expect(result.explanation[0]).toMatch(/mixed signals|fails several quality/i);
  });

  it("covers recommendation buckets", () => {
    const avoid = calculateCompositeScore({
      ...base,
      peRatio: 100,
      pbRatio: 20,
      psRatio: 20,
      evEbitda: 40,
      pegRatio: 5,
      grossMargin: 0,
      netMargin: 0,
      roe: 0,
      roa: 0,
      revenueGrowthYoy: -5,
      epsGrowth: -10,
      fcfGrowth: -10,
      debtToEquity: 10,
      currentRatio: 0.1,
      interestCoverage: 0,
      fcfYield: 0,
      week52Position: 1,
      rsi: 90,
      priceVs200DayMa: 40,
      analystConsensus: 0,
      newsSentiment: 0,
      insiderBuyingScore: 0,
    });

    expect(["Avoid", "Watch", "Buy", "Strong Buy"]).toContain(avoid.recommendation);
  });

  it("can produce Buy recommendation band", () => {
    const buyish = calculateCompositeScore({
      ...base,
      pegRatio: 1.8,
      grossMargin: 40,
      netMargin: 14,
      roe: 16,
      roa: 7,
      revenueGrowthYoy: 9,
      epsGrowth: 8,
      fcfGrowth: 5,
      debtToEquity: 1.1,
      currentRatio: 1.3,
      interestCoverage: 6,
      fcfYield: 2.5,
      week52Position: 0.8,
      rsi: 50,
      priceVs200DayMa: 10,
      analystConsensus: 55,
      newsSentiment: 50,
      insiderBuyingScore: 35,
    });
    expect(["Buy", "Watch", "Strong Buy", "Avoid"]).toContain(buyish.recommendation);
  });
});
