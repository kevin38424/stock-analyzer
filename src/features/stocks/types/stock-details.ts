export type RangeOption = "1D" | "1W" | "1M" | "1Y" | "ALL";

export type PricePoint = {
  date: string;
  price: number;
  sma200: number;
};

export type ScoreBreakdownRow = {
  key: "valuation" | "profitability" | "growth" | "health" | "momentum";
  label: string;
  weightPct: number;
  score: number;
};

export type LabeledMetric = {
  label: string;
  value: string;
};

export type MetricPanel = {
  title: string;
  badge: string;
  badgeTone: "amber" | "emerald";
  rows: LabeledMetric[];
};

export type PeerComparisonRow = {
  ticker: string;
  score: number;
  pe: number;
  marketCapUsdTrillion: number;
  rating: "STRONG BUY" | "BUY" | "WATCH" | "AVOID";
};

export type NewsKind = "MARKET NEWS" | "ANALYSIS";

export type NewsItem = {
  id: string;
  kind: NewsKind;
  publishedAt: string;
  title: string;
  summary: string;
  imageUrl?: string;
  url?: string;
};

export type InsiderTransaction = {
  id: string;
  name: string;
  role: string;
  date: string;
  actionLabel: string;
  valueLabel: string;
  tone: "sell" | "buy";
};

export type StockDetailsResponse = {
  ticker: string;
  companyName: string;
  exchange: string;
  sector: string;
  industry: string;
  headquarters: string;
  priceSummary: {
    lastPrice: number;
    change: number;
    changePercent: number;
    asOf: string;
  };
  rating: {
    score: number;
    outOf: 100;
    label: "Strong Buy" | "Buy" | "Watch" | "Avoid";
  };
  pricePerformance: {
    range: RangeOption;
    points: PricePoint[];
  };
  scoreBreakdown: ScoreBreakdownRow[];
  highlights: {
    attractive: string[];
    risks: string[];
  };
  financialMetrics: MetricPanel[];
  peerComparison: PeerComparisonRow[];
  analystConsensus: {
    recommendation: "Buy" | "Hold" | "Sell";
    analystCount: number;
    targetHigh: number;
    targetMedian: number;
    targetLow: number;
  };
  news: NewsItem[];
  insiderActivity: {
    transactions: InsiderTransaction[];
    net3mSellUsd: number;
  };
  meta: {
    generatedAt: string;
    sourceCoverage: string[];
    isMock: boolean;
  };
};
