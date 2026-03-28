import { fetchJson } from "@/lib/http/fetch-json";
import type { SearchCategoryKey, StockSearchQuery, StockSearchResponse } from "@/features/stocks/types/search";

export type GetSearchResultsParams = {
  q: string;
  category?: SearchCategoryKey;
  limit?: number;
  includeTrending?: boolean;
  userId?: string | null;
};

const DEFAULT_QUERY: Pick<StockSearchQuery, "category" | "limit" | "includeTrending"> = {
  category: "all",
  limit: 25,
  includeTrending: true,
};

export async function getSearchResults(params: GetSearchResultsParams): Promise<StockSearchResponse> {
  const query = {
    ...DEFAULT_QUERY,
    ...params,
  };

  const searchParams = new URLSearchParams({
    q: query.q,
    category: query.category ?? "all",
    limit: String(query.limit ?? 25),
    includeTrending: String(query.includeTrending ?? true),
  });

  if (params.userId) {
    searchParams.set("userId", params.userId);
  }

  return fetchJson<StockSearchResponse>(`/api/search?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}
