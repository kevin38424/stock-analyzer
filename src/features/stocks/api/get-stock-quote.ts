import { fetchJson } from "@/lib/http/fetch-json";

export type StockQuote = {
  ticker: string;
  price: number;
  previousClose: number | null;
  changePercent: number | null;
  marketCap: number | null;
  volume: number | null;
  fetchedAt: string;
  sourceProvider: string;
};

type MarketQuotesResponse = {
  requested: string[];
  quotes: StockQuote[];
};

export async function getStockQuote(input: {
  ticker: string;
  maxAgeSeconds?: number;
}): Promise<StockQuote | null> {
  const searchParams = new URLSearchParams({
    symbols: input.ticker.toUpperCase(),
  });

  if (input.maxAgeSeconds != null) {
    searchParams.set("maxAgeSeconds", String(input.maxAgeSeconds));
  }

  const payload = await fetchJson<MarketQuotesResponse>(`/api/market/quotes?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  return payload.quotes[0] ?? null;
}
