import type { StockSearchResponse } from "@/features/stocks/types/search";
import { getEmptySearchResponse } from "@/lib/search/get-search-results";
import { getSearchResults } from "@/features/stocks/api/get-search-results";

export async function searchStocks(query: string): Promise<StockSearchResponse> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return getEmptySearchResponse("");
  }

  try {
    return await getSearchResults({ q: trimmedQuery });
  } catch {
    throw new Error("Unable to search stocks right now.");
  }
}
