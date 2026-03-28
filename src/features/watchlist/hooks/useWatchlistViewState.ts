"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import type { WatchlistSegment, WatchlistSortBy } from "@/features/watchlist/types/watchlist";
import { normalizeWatchlistViewQuery, type WatchlistViewQuery } from "@/features/watchlist/hooks/watchlistViewQuery";

function toSearchParams(query: WatchlistViewQuery): URLSearchParams {
  return new URLSearchParams({
    segment: query.segment,
    sortBy: query.sortBy,
  });
}

export function useWatchlistViewState(options?: { initialQuery?: Partial<WatchlistViewQuery> }) {
  const router = useRouter();
  const pathname = usePathname() || "/watchlist";

  const initialState = useMemo(
    () => normalizeWatchlistViewQuery(options?.initialQuery),
    [options?.initialQuery],
  );

  const [queryState, setQueryState] = useState<WatchlistViewQuery>(initialState);

  function syncUrl(nextState: WatchlistViewQuery) {
    const params = toSearchParams(nextState);
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
  }

  function setSegment(segment: WatchlistSegment) {
    const nextState = {
      ...queryState,
      segment,
    };
    setQueryState(nextState);
    syncUrl(nextState);
  }

  function setSortBy(sortBy: WatchlistSortBy) {
    const nextState = {
      ...queryState,
      sortBy,
    };
    setQueryState(nextState);
    syncUrl(nextState);
  }

  function cycleSortBy(options: WatchlistSortBy[]) {
    if (options.length === 0) return;

    const currentIndex = options.findIndex((option) => option === queryState.sortBy);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % options.length : 0;
    setSortBy(options[nextIndex]);
  }

  return {
    queryState,
    setSegment,
    setSortBy,
    cycleSortBy,
  };
}

export { normalizeWatchlistViewQuery, type WatchlistViewQuery } from "@/features/watchlist/hooks/watchlistViewQuery";
