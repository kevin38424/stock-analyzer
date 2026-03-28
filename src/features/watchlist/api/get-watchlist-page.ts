import type { WatchlistPagePayload, WatchlistSegment, WatchlistSortBy } from "@/features/watchlist/types/watchlist";
import { fetchJson } from "@/lib/http/fetch-json";

export type GetWatchlistPageParams = {
  userId?: string | null;
  segment?: WatchlistSegment;
  sortBy?: WatchlistSortBy;
};

export async function getWatchlistPage(params: GetWatchlistPageParams = {}): Promise<WatchlistPagePayload> {
  const searchParams = new URLSearchParams({
    segment: params.segment ?? "all_holdings",
    sortBy: params.sortBy ?? "score_desc",
  });

  if (params.userId) {
    searchParams.set("userId", params.userId);
  }

  return fetchJson<WatchlistPagePayload>(`/api/watchlist?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}
