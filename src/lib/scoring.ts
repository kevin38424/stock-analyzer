import { average, clamp, round } from "@/lib/utils";
import type { RawStockMetrics, ScoreBreakdown } from "@/types/stock";

function inverseScore(value: number, goodThreshold: number, badThreshold: number): number {
  if (value <= goodThreshold) return 100;
  if (value >= badThreshold) return 0;
  return clamp(((badThreshold - value) / (badThreshold - goodThreshold)) * 100);
}

function directScore(value: number, badThreshold: number, goodThreshold: number): number {
  if (value <= badThreshold) return 0;
  if (value >= goodThreshold) return 100;
  return clamp(((value - badThreshold) / (goodThreshold - badThreshold)) * 100);
}

function centeredRsiScore(rsi: number): number {
  const distanceFromOversoldOpportunity = Math.abs(rsi - 35);
  return clamp(100 - distanceFromOversoldOpportunity * 3);
}

function recommendation(total: number): ScoreBreakdown["recommendation"] {
  if (total >= 85) return "Strong Buy";
  if (total >= 70) return "Buy";
  if (total >= 50) return "Watch";
  return "Avoid";
}

function explanation(metrics: RawStockMetrics, total: number): string[] {
  const reasons: string[] = [];

  if (metrics.pegRatio < 1.2) reasons.push("PEG ratio suggests valuation is reasonable relative to growth.");
  if (metrics.roe > 15) reasons.push("ROE is strong, which points to good capital efficiency.");
  if (metrics.revenueGrowthYoy > 8) reasons.push("Revenue growth remains healthy year over year.");
  if (metrics.debtToEquity < 1) reasons.push("Debt-to-equity is manageable.");
  if (metrics.insiderBuyingScore > 70) reasons.push("Recent insider activity is supportive.");

  if (reasons.length === 0) {
    reasons.push(
      total >= 50
        ? "The stock has mixed signals and may deserve monitoring rather than immediate action."
        : "The stock currently fails several quality or valuation checks in the model.",
    );
  }

  return reasons.slice(0, 4);
}

export function calculateCompositeScore(metrics: RawStockMetrics): ScoreBreakdown {
  const valuation = average([
    inverseScore(metrics.peRatio, 10, 35),
    inverseScore(metrics.pbRatio, 1, 10),
    inverseScore(metrics.psRatio, 1, 15),
    inverseScore(metrics.evEbitda, 6, 24),
    inverseScore(metrics.pegRatio, 0.8, 3),
  ]);

  const profitability = average([
    directScore(metrics.grossMargin, 20, 60),
    directScore(metrics.netMargin, 5, 30),
    directScore(metrics.roe, 5, 25),
    directScore(metrics.roa, 2, 15),
  ]);

  const growth = average([
    directScore(metrics.revenueGrowthYoy, 0, 20),
    directScore(metrics.epsGrowth, 0, 25),
    directScore(metrics.fcfGrowth, -5, 20),
  ]);

  const financialHealth = average([
    inverseScore(metrics.debtToEquity, 0.5, 2.5),
    directScore(metrics.currentRatio, 1, 2.5),
    directScore(metrics.interestCoverage, 2, 15),
    directScore(metrics.fcfYield, 1, 8),
  ]);

  const momentum = average([
    inverseScore(metrics.week52Position, 0.2, 1),
    centeredRsiScore(metrics.rsi),
    inverseScore(metrics.priceVs200DayMa, -5, 25),
  ]);

  const sentiment = average([
    directScore(metrics.analystConsensus, 0, 100),
    directScore(metrics.newsSentiment, 0, 100),
    directScore(metrics.insiderBuyingScore, 0, 100),
  ]);

  const total = round(
    valuation * 0.3 +
      profitability * 0.2 +
      growth * 0.2 +
      financialHealth * 0.15 +
      momentum * 0.1 +
      sentiment * 0.05,
  );

  return {
    valuation: round(valuation),
    profitability: round(profitability),
    growth: round(growth),
    financialHealth: round(financialHealth),
    momentum: round(momentum),
    sentiment: round(sentiment),
    total,
    recommendation: recommendation(total),
    explanation: explanation(metrics, total),
  };
}
