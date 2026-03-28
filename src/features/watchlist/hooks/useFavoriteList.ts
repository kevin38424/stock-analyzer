"use client";

import { useMemo } from "react";
import { useWatchlistPage } from "@/features/watchlist/hooks/useWatchlistPage";

export type FavoriteListItem = {
  ticker: string;
  score: number;
};

export type UseFavoriteListOptions = {
  limit?: number;
  enabled?: boolean;
  refetchInterval?: number;
};

const fallbackFavorites: FavoriteListItem[] = [
  { ticker: "GOOGL", score: 80.22 },
  { ticker: "MSFT", score: 72.34 },
];

export function useFavoriteList(options: UseFavoriteListOptions = {}) {
  const limit = options.limit ?? 2;

  const { data, isLoading, isFetching, isError, error, refetch } = useWatchlistPage({
    segment: "all_holdings",
    sortBy: "score_desc",
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
  });

  const favorites = useMemo<FavoriteListItem[]>(() => {
    const fromWatchlist =
      data?.rows.slice(0, limit).map((row) => ({
        ticker: row.ticker,
        score: row.score,
      })) ?? [];

    if (fromWatchlist.length > 0) {
      return fromWatchlist;
    }

    return fallbackFavorites.slice(0, limit);
  }, [data?.rows, limit]);

  return {
    favorites,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
