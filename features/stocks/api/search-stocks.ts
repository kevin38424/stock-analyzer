import type { StockSearchResult } from "@/features/stocks/types/search";

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to search stocks right now.");
  }

  const data = (await response.json()) as { results?: StockSearchResult[] };
  return data.results ?? [];
}
