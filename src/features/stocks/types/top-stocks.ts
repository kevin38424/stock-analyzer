export type ValuationStyle = "growth" | "value" | "income";

export type TopStocksQuery = {
  limit: number;
  offset: number;
  favoritesOnly: boolean;
  minScore: number;
  maxScore: number;
  sector: string;
  valuationStyle: ValuationStyle;
  userId: string | null;
};

export type TopStocksFactorScores = {
  fundamentals: number;
  momentum: number;
  sentiment: number;
  valueScore: number;
};

export type TopStocksFeaturedCard = {
  rank: number;
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  score: number;
  recommendation: "STRONG BUY" | "BUY" | "HOLD" | "WATCH" | "AVOID";
  price: number;
  changePercent: number;
  whyItRanks: string;
  factors: TopStocksFactorScores;
};

export type TopStocksRow = {
  rank: number;
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  score: number;
  recommendation: "BUY" | "HOLD" | "WATCH" | "AVOID";
  price: number;
  changePercent: number;
  isFavorite: boolean;
};

export type TopStocksSummary = {
  title: string;
  subtitle: string;
  asOfDate: string;
  generatedAt: string;
  totalUniverseCount: number;
  filteredCount: number;
};

export type TopStocksFilterMetadata = {
  sectors: string[];
  valuationStyles: ValuationStyle[];
  scoreRange: {
    min: number;
    max: number;
  };
};

export type TopStocksPagePayload = {
  summary: TopStocksSummary;
  filterMetadata: TopStocksFilterMetadata;
  algorithmNote: string;
  featured: TopStocksFeaturedCard;
  rows: TopStocksRow[];
  page: {
    limit: number;
    offset: number;
    nextOffset: number | null;
    hasMore: boolean;
  };
};
