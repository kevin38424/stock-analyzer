import { fetchJson } from "@/lib/http/fetch-json";
import type { WatchlistSegment } from "@/features/watchlist/types/watchlist";

export type WatchlistMutationResponse = {
  success: boolean;
  data?: unknown;
};

export type CreateWatchlistItemParams = {
  userId: string;
  ticker?: string;
  companyId?: string;
  segment?: WatchlistSegment;
  thesis?: string;
};

export type PatchWatchlistItemParams = {
  userId: string;
  ticker?: string;
  companyId?: string;
  segment?: WatchlistSegment;
  thesis?: string | null;
};

export type DeleteWatchlistItemParams = {
  userId: string;
  ticker?: string;
  companyId?: string;
};

export async function createWatchlistItem(
  params: CreateWatchlistItemParams,
): Promise<WatchlistMutationResponse> {
  return fetchJson<WatchlistMutationResponse>("/api/watchlist", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: params.userId,
      ticker: params.ticker,
      companyId: params.companyId,
      segment: params.segment ?? "all_holdings",
      thesis: params.thesis,
    }),
  });
}

export async function patchWatchlistItem(
  params: PatchWatchlistItemParams,
): Promise<WatchlistMutationResponse> {
  return fetchJson<WatchlistMutationResponse>("/api/watchlist", {
    method: "PATCH",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: params.userId,
      ticker: params.ticker,
      companyId: params.companyId,
      segment: params.segment,
      thesis: params.thesis,
    }),
  });
}

export async function deleteWatchlistItem(
  params: DeleteWatchlistItemParams,
): Promise<WatchlistMutationResponse> {
  return fetchJson<WatchlistMutationResponse>("/api/watchlist", {
    method: "DELETE",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: params.userId,
      ticker: params.ticker,
      companyId: params.companyId,
    }),
  });
}
