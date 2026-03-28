"use client";

import { useQuery } from "@tanstack/react-query";
import { getStockQuote, type StockQuote } from "@/features/stocks/api/get-stock-quote";

export type UseStockQuoteOptions = {
  ticker: string;
  enabled?: boolean;
  refetchInterval?: number;
  maxAgeSeconds?: number;
};

export function useStockQuote(options: UseStockQuoteOptions) {
  const normalizedTicker = options.ticker.toUpperCase();

  const query = useQuery<StockQuote | null, Error>({
    queryKey: ["stock-quote", normalizedTicker, options.maxAgeSeconds ?? null],
    queryFn: () =>
      getStockQuote({
        ticker: normalizedTicker,
        maxAgeSeconds: options.maxAgeSeconds,
      }),
    enabled: (options.enabled ?? true) && Boolean(normalizedTicker),
    refetchInterval: options.refetchInterval ?? 10_000,
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
