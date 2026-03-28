import type { ScoreBreakdown } from "@/types/stock";

export type HomeKpiSummary = {
  stocksAnalyzed: number;
  stocksAnalyzedDelta: number;
  strongBuys: number;
  strongBuysPercent: number;
  averageScore: number;
  mostImprovedTicker: string;
  mostImprovedDeltaScore: number;
  watchlistAlerts: number;
};

export type HomeTopStockRow = {
  rank: number;
  ticker: string;
  companyName: string;
  sector: string;
  score: number;
  recommendation: ScoreBreakdown["recommendation"];
  price: number;
  changePercent: number;
};

export type HomeWatchlistRow = {
  ticker: string;
  companyName: string;
  score: number;
  signal: "Strong Buy" | "Buy" | "Hold" | "Watch";
  price: number;
  changePercent: number;
};

export type SectorPerformanceRow = {
  sector: string;
  changePercent: number;
};

export type ScoreDistributionBin = {
  binStart: number;
  binEnd: number;
  count: number;
};

export type HomeInsight = {
  title: string;
  message: string;
};

export type HomeDashboardResponse = {
  generatedAt: string;
  kpis: HomeKpiSummary;
  topStocks: HomeTopStockRow[];
  watchlistPreview: HomeWatchlistRow[];
  sectorPerformance: SectorPerformanceRow[];
  scoreDistribution: ScoreDistributionBin[];
  insight: HomeInsight;
};
