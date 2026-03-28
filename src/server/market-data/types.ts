export type LiveQuote = {
  ticker: string;
  price: number;
  previousClose: number | null;
  changePercent: number | null;
  marketCap: number | null;
  volume: number | null;
  fetchedAt: string;
  sourceProvider: string;
};

export type MarketDataProvider = {
  name: string;
  fetchQuotes: (tickers: string[]) => Promise<LiveQuote[]>;
};
