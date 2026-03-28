export type SearchCategoryKey = "all" | "stocks" | "etfs" | "options";

export type StockSearchResult = {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  assetType: "stock" | "etf" | "option";
  marketCapLabel: string;
  score: number;
  sentiment: "BULLISH" | "STRONG" | "NEUTRAL" | "BEARISH";
};

export type SearchCategoryBucket = {
  key: SearchCategoryKey;
  label: string;
  count: number;
};

export type SearchTrendingSector = {
  name: string;
  changeToday: string;
  note: string;
};

export type StockSearchResponse = {
  query: string;
  total: number;
  sortedBy: "Relevance";
  categories: SearchCategoryBucket[];
  trendingSector: SearchTrendingSector;
  results: StockSearchResult[];
};

export type StockSearchQuery = {
  q: string;
  category?: SearchCategoryKey;
  limit?: number;
  includeTrending?: boolean;
  userId?: string | null;
};
