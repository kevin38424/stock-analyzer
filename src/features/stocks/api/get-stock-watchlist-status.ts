import type { WatchlistPagePayload } from "@/features/watchlist/types/watchlist";
import { fetchJson } from "@/lib/http/fetch-json";

export type StockWatchlistStatus = {
  isInWatchlist: boolean;
  watchlistCount: number;
};

export async function getStockWatchlistStatus(input: {
  ticker: string;
  userId: string | null;
}): Promise<StockWatchlistStatus> {
  if (!input.userId) {
    return { isInWatchlist: false, watchlistCount: 0 };
  }

  const searchParams = new URLSearchParams({
    segment: "all_holdings",
    sortBy: "score_desc",
    userId: input.userId,
  });

  const payload = await fetchJson<WatchlistPagePayload>(`/api/watchlist?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const normalizedTicker = input.ticker.toUpperCase();
  const isInWatchlist = payload.rows.some((row) => row.ticker.toUpperCase() === normalizedTicker);

  return {
    isInWatchlist,
    watchlistCount: payload.rows.length,
  };
}
