"use client";

import { useQuery } from "@tanstack/react-query";
import { searchStocks } from "@/features/stocks/api/search-stocks";
import type { StockSearchResponse } from "@/features/stocks/types/search";

export type UseStockSearchOptions = {
  query: string;
  enabled?: boolean;
  refetchInterval?: number;
};

export function useStockSearch(options: UseStockSearchOptions) {
  const submittedQuery = options.query.trim();
  const enabled = options.enabled ?? submittedQuery.length > 0;

  const query = useQuery<StockSearchResponse, Error>({
    queryKey: ["stock-search", submittedQuery],
    queryFn: () => searchStocks(submittedQuery),
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
