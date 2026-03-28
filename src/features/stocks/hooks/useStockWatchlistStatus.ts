"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getStockWatchlistStatus,
  type StockWatchlistStatus,
} from "@/features/stocks/api/get-stock-watchlist-status";

export type UseStockWatchlistStatusOptions = {
  ticker: string;
  userId: string | null;
  enabled?: boolean;
  refetchInterval?: number;
};

export function useStockWatchlistStatus(options: UseStockWatchlistStatusOptions) {
  const normalizedTicker = options.ticker.toUpperCase();
  const userId = options.userId;

  const query = useQuery<StockWatchlistStatus, Error>({
    queryKey: ["stock-watchlist-status", userId, normalizedTicker],
    queryFn: () =>
      getStockWatchlistStatus({
        ticker: normalizedTicker,
        userId,
      }),
    enabled: (options.enabled ?? true) && Boolean(normalizedTicker),
    refetchInterval: options.refetchInterval ?? 30_000,
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
