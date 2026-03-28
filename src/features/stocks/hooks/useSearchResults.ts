"use client";

import { useQuery } from "@tanstack/react-query";
import { getSearchResults, type GetSearchResultsParams } from "@/features/stocks/api/get-search-results";
import type { StockSearchResponse } from "@/features/stocks/types/search";

export type UseSearchResultsOptions = GetSearchResultsParams & {
  enabled?: boolean;
  refetchInterval?: number;
};

export function useSearchResults(options: UseSearchResultsOptions) {
  const trimmedQuery = options.q.trim();
  const category = options.category ?? "all";
  const limit = options.limit ?? 25;
  const includeTrending = options.includeTrending ?? true;
  const enabled = options.enabled ?? trimmedQuery.length > 0;

  const query = useQuery<StockSearchResponse, Error>({
    queryKey: [
      "search-results",
      {
        q: trimmedQuery,
        category,
        limit,
        includeTrending,
        userId: options.userId ?? null,
      },
    ],
    queryFn: () =>
      getSearchResults({
        q: trimmedQuery,
        category,
        limit,
        includeTrending,
        userId: options.userId ?? null,
      }),
    enabled,
    refetchInterval: options.refetchInterval,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
