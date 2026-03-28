"use client";

import { useEffect } from "react";
import { emitMarketQuotesUpdated } from "@/features/watchlist/live/watchlist-live-events";

type UseWatchlistRealtimeMockOptions = {
  symbols: string[];
  enabled?: boolean;
  intervalMs?: number;
};

export function useWatchlistRealtimeMock(options: UseWatchlistRealtimeMockOptions) {
  const { symbols, enabled = false, intervalMs = 6000 } = options;

  useEffect(() => {
    if (!enabled || symbols.length === 0 || typeof window === "undefined") {
      return;
    }

    const timerId = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      const symbol = symbols[randomIndex];
      emitMarketQuotesUpdated({ tickers: [symbol], source: "mock" });
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [enabled, intervalMs, symbols]);
}
