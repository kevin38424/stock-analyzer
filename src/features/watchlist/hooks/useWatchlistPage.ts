"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getWatchlistPage, type GetWatchlistPageParams } from "@/features/watchlist/api/get-watchlist-page";
import type { WatchlistPagePayload } from "@/features/watchlist/types/watchlist";
import {
  MARKET_QUOTES_UPDATED_EVENT,
} from "@/features/watchlist/live/watchlist-live-events";

export type UseWatchlistPageOptions = GetWatchlistPageParams & {
  enabled?: boolean;
  refetchInterval?: number;
  enableLiveInvalidation?: boolean;
};

export function useWatchlistPage(options: UseWatchlistPageOptions = {}) {
  const userId = options.userId ?? null;
  const segment = options.segment ?? "all_holdings";
  const sortBy = options.sortBy ?? "score_desc";
  const queryClient = useQueryClient();

  useEffect(() => {
    if (options.enableLiveInvalidation === false) {
      return;
    }

    const onQuotesUpdated = (_event: Event) => {
      void queryClient.invalidateQueries({ queryKey: ["watchlist-page"] });
    };

    window.addEventListener(MARKET_QUOTES_UPDATED_EVENT, onQuotesUpdated as EventListener);

    return () => {
      window.removeEventListener(MARKET_QUOTES_UPDATED_EVENT, onQuotesUpdated as EventListener);
    };
  }, [options.enableLiveInvalidation, queryClient]);

  const query = useQuery<WatchlistPagePayload, Error>({
    queryKey: ["watchlist-page", { userId, segment, sortBy }],
    queryFn: () =>
      getWatchlistPage({
        userId,
        segment,
        sortBy,
      }),
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
