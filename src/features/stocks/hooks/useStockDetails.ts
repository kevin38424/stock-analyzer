"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getStockDetails } from "@/features/stocks/api/get-stock-details";
import {
  MARKET_QUOTES_UPDATED_EVENT,
  type MarketQuotesUpdatedPayload,
} from "@/features/shared/live/market-events";
import type { RangeOption, StockDetailsResponse } from "@/features/stocks/types/stock-details";

export type UseStockDetailsOptions = {
  ticker: string;
  range?: RangeOption;
  enabled?: boolean;
  refetchInterval?: number;
  enableLiveInvalidation?: boolean;
};

export function useStockDetails(options: UseStockDetailsOptions) {
  const normalizedTicker = options.ticker.toUpperCase();
  const range = options.range ?? "1M";
  const queryClient = useQueryClient();

  useEffect(() => {
    if (options.enableLiveInvalidation === false) {
      return;
    }

    const onQuotesUpdated = (event: Event) => {
      const detail = (event as CustomEvent<MarketQuotesUpdatedPayload>).detail;
      const tickers = detail?.tickers ?? [];

      if (!tickers.length || tickers.includes(normalizedTicker)) {
        void queryClient.invalidateQueries({
          queryKey: ["stock-details", normalizedTicker],
        });
      }
    };

    window.addEventListener(MARKET_QUOTES_UPDATED_EVENT, onQuotesUpdated as EventListener);

    return () => {
      window.removeEventListener(MARKET_QUOTES_UPDATED_EVENT, onQuotesUpdated as EventListener);
    };
  }, [normalizedTicker, options.enableLiveInvalidation, queryClient]);

  const query = useQuery<StockDetailsResponse, Error>({
    queryKey: ["stock-details", normalizedTicker, range],
    queryFn: () => getStockDetails({ ticker: normalizedTicker, range }),
    placeholderData: (previousData) => previousData,
    enabled: (options.enabled ?? true) && Boolean(normalizedTicker),
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
