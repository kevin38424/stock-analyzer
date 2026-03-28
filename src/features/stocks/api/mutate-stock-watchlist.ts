import type { WatchlistSegment } from "@/features/watchlist/types/watchlist";
import { fetchJson } from "@/lib/http/fetch-json";

export type StockWatchlistCreateInput = {
  userId: string;
  ticker: string;
  segment?: WatchlistSegment;
  thesis?: string;
};

export type StockWatchlistRemoveInput = {
  userId: string;
  ticker: string;
};

export async function addStockToWatchlist(input: StockWatchlistCreateInput) {
  return fetchJson<{ success: boolean; data?: unknown }>("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: input.userId,
      ticker: input.ticker.toUpperCase(),
      segment: input.segment ?? "all_holdings",
      thesis: input.thesis,
    }),
    cache: "no-store",
  });
}

export async function removeStockFromWatchlist(input: StockWatchlistRemoveInput) {
  return fetchJson<{ success: boolean; data?: unknown }>("/api/watchlist", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: input.userId,
      ticker: input.ticker.toUpperCase(),
    }),
    cache: "no-store",
  });
}
