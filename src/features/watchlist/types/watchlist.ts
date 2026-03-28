export type WatchlistSegment = "all_holdings" | "tech_growth" | "dividends" | "speculative";

export type WatchlistSortBy =
  | "score_desc"
  | "score_asc"
  | "delta_desc"
  | "delta_asc"
  | "price_desc"
  | "price_asc";

export type WatchlistRecommendation = "STRONG BUY" | "BUY" | "HOLD" | "WATCH" | "AVOID";

export type WatchlistRow = {
  ticker: string;
  companyName: string;
  sector: string;
  segment: WatchlistSegment;
  score: number;
  deltaScore: number;
  price: number;
  changePercent: number;
  recommendation: WatchlistRecommendation;
  thesis: string;
};

export type WatchlistKpiCard = {
  label: string;
  value: string;
  detail?: string;
  ticker?: string;
};

export type WatchlistPagePayload = {
  summary: {
    title: string;
    subtitle: string;
    generatedAt: string;
  };
  kpis: {
    averageScore: WatchlistKpiCard;
    topPick: WatchlistKpiCard;
    bigUpgrade: WatchlistKpiCard;
    atRisk: WatchlistKpiCard;
  };
  filters: {
    segments: Array<{ id: WatchlistSegment; label: string }>;
    selectedSegment: WatchlistSegment;
    sortBy: WatchlistSortBy;
  };
  rows: WatchlistRow[];
  totalTracked: number;
};

export type WatchlistQuery = {
  userId: string | null;
  segment: WatchlistSegment;
  sortBy: WatchlistSortBy;
};
