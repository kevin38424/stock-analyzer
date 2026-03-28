"use client";

import { useQuery } from "@tanstack/react-query";
import { getTopStocksPage, type GetTopStocksPageParams } from "@/features/stocks/api/get-top-stocks-page";
import type { TopStocksPagePayload } from "@/features/stocks/types/top-stocks";

export type UseTopStocksPageOptions = GetTopStocksPageParams & {
  enabled?: boolean;
  refetchInterval?: number;
};

export function useTopStocksPage(options: UseTopStocksPageOptions = {}) {
  const query = useQuery<TopStocksPagePayload, Error>({
    queryKey: [
      "top-stocks-page",
      {
        userId: options.userId ?? null,
        limit: options.limit ?? 25,
        offset: options.offset ?? 0,
        favoritesOnly: options.favoritesOnly ?? false,
        minScore: options.minScore ?? 0,
        maxScore: options.maxScore ?? 100,
        sector: options.sector ?? "all",
        valuationStyle: options.valuationStyle ?? "growth",
      },
    ],
    queryFn: () => getTopStocksPage(options),
    placeholderData: (previousData) => previousData,
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval ?? 15_000,
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
