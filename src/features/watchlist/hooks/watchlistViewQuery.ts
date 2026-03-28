import type { WatchlistQuery, WatchlistSegment, WatchlistSortBy } from "@/features/watchlist/types/watchlist";

export type WatchlistViewQuery = Pick<WatchlistQuery, "segment" | "sortBy">;
export type WatchlistViewQueryInput = {
  segment?: string;
  sortBy?: string;
};

const defaultQuery: WatchlistViewQuery = {
  segment: "all_holdings",
  sortBy: "score_desc",
};

const validSegments: WatchlistSegment[] = ["all_holdings", "tech_growth", "dividends", "speculative"];
const validSortBy: WatchlistSortBy[] = [
  "score_desc",
  "score_asc",
  "delta_desc",
  "delta_asc",
  "price_desc",
  "price_asc",
];

function isValidSegment(value: string | undefined): value is WatchlistSegment {
  return Boolean(value && validSegments.includes(value as WatchlistSegment));
}

function isValidSortBy(value: string | undefined): value is WatchlistSortBy {
  return Boolean(value && validSortBy.includes(value as WatchlistSortBy));
}

export function normalizeWatchlistViewQuery(initialQuery?: WatchlistViewQueryInput): WatchlistViewQuery {
  return {
    segment: isValidSegment(initialQuery?.segment) ? initialQuery.segment : defaultQuery.segment,
    sortBy: isValidSortBy(initialQuery?.sortBy) ? initialQuery.sortBy : defaultQuery.sortBy,
  };
}
