"use client";

import { useMemo, useState } from "react";
import { useStockWatchlistActions } from "@/features/stocks/hooks/useStockWatchlistActions";
import type { TopStocksRow } from "@/features/stocks/types/top-stocks";

type UseTopStocksRowActionsOptions = {
  rows: TopStocksRow[];
  userId?: string | null;
};

export function useTopStocksRowActions(options: UseTopStocksRowActionsOptions) {
  const { addToWatchlist, removeFromWatchlist } = useStockWatchlistActions();

  const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
  const [pendingByTicker, setPendingByTicker] = useState<Record<string, boolean>>({});
  const [activeMenuTicker, setActiveMenuTicker] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const favoriteMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const row of options.rows) {
      const ticker = row.ticker.toUpperCase();
      map.set(ticker, favoriteOverrides[ticker] ?? row.isFavorite);
    }
    return map;
  }, [options.rows, favoriteOverrides]);

  function getRowFavorite(row: TopStocksRow) {
    return favoriteMap.get(row.ticker.toUpperCase()) ?? row.isFavorite;
  }

  function isPending(ticker: string) {
    return Boolean(pendingByTicker[ticker.toUpperCase()]);
  }

  async function toggleFavorite(row: TopStocksRow) {
    const ticker = row.ticker.toUpperCase();
    const previousValue = getRowFavorite(row);
    const nextValue = !previousValue;

    setFavoriteOverrides((prev) => ({ ...prev, [ticker]: nextValue }));

    if (!options.userId) {
      setFeedbackMessage(
        nextValue
          ? `${ticker} added to local favorites (sign in to persist).`
          : `${ticker} removed from local favorites (sign in to persist).`,
      );
      return;
    }

    setPendingByTicker((prev) => ({ ...prev, [ticker]: true }));

    try {
      if (nextValue) {
        await addToWatchlist({
          userId: options.userId,
          ticker,
          segment: "all_holdings",
        });
        setFeedbackMessage(`${ticker} added to watchlist.`);
      } else {
        await removeFromWatchlist({
          userId: options.userId,
          ticker,
        });
        setFeedbackMessage(`${ticker} removed from watchlist.`);
      }
    } catch {
      setFavoriteOverrides((prev) => ({ ...prev, [ticker]: previousValue }));
      setFeedbackMessage(`Could not update ${ticker} watchlist state.`);
    } finally {
      setPendingByTicker((prev) => ({ ...prev, [ticker]: false }));
    }
  }

  function toggleRowMenu(ticker: string) {
    const normalized = ticker.toUpperCase();
    setActiveMenuTicker((prev) => (prev === normalized ? null : normalized));
  }

  function closeRowMenu() {
    setActiveMenuTicker(null);
  }

  async function copyTicker(ticker: string) {
    const normalized = ticker.toUpperCase();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(normalized);
      }
      setFeedbackMessage(`${normalized} copied.`);
    } catch {
      setFeedbackMessage(`Unable to copy ${normalized}.`);
    }
  }

  function clearFeedback() {
    setFeedbackMessage(null);
  }

  return {
    getRowFavorite,
    isPending,
    toggleFavorite,
    activeMenuTicker,
    toggleRowMenu,
    closeRowMenu,
    copyTicker,
    feedbackMessage,
    clearFeedback,
  };
}
