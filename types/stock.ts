export type ScoreCategory =
  | "valuation"
  | "profitability"
  | "growth"
  | "financialHealth"
  | "momentum"
  | "sentiment";

export type RawStockMetrics = {
  ticker: string;
  companyName: string;
  sector: string;
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  evEbitda: number;
  pegRatio: number;
  grossMargin: number;
  netMargin: number;
  roe: number;
  roa: number;
  revenueGrowthYoy: number;
  epsGrowth: number;
  fcfGrowth: number;
  debtToEquity: number;
  currentRatio: number;
  interestCoverage: number;
  fcfYield: number;
  week52Position: number;
  rsi: number;
  priceVs200DayMa: number;
  analystConsensus: number;
  newsSentiment: number;
  insiderBuyingScore: number;
};

export type ScoreBreakdown = {
  valuation: number;
  profitability: number;
  growth: number;
  financialHealth: number;
  momentum: number;
  sentiment: number;
  total: number;
  recommendation: "Strong Buy" | "Buy" | "Watch" | "Avoid";
  explanation: string[];
};
