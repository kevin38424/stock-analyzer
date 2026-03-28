"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import type { ValuationStyle } from "@/features/stocks/types/top-stocks";

export type TopStocksFilters = {
  favoritesOnly: boolean;
  minScore: number;
  maxScore: number;
  sector: string;
  valuationStyle: ValuationStyle;
};

export type TopStocksQueryState = TopStocksFilters & {
  limit: number;
  offset: number;
};

export type TopStocksViewInitialQuery = Partial<TopStocksQueryState>;

const scoreMin = 0;
const scoreMax = 100;

const defaultFilters: TopStocksFilters = {
  favoritesOnly: false,
  minScore: 85,
  maxScore: 100,
  sector: "all",
  valuationStyle: "growth",
};

const defaultQueryState: TopStocksQueryState = {
  ...defaultFilters,
  limit: 50,
  offset: 0,
};

function clampScore(value: number) {
  if (Number.isNaN(value)) return scoreMin;
  return Math.min(scoreMax, Math.max(scoreMin, value));
}

export function normalizeTopStocksQueryState(initialQuery?: TopStocksViewInitialQuery): TopStocksQueryState {
  const merged: TopStocksQueryState = {
    ...defaultQueryState,
    ...initialQuery,
  };

  const normalizedMinScore = clampScore(merged.minScore);
  const normalizedMaxScore = clampScore(merged.maxScore);

  return {
    ...merged,
    minScore: Math.min(normalizedMinScore, normalizedMaxScore),
    maxScore: Math.max(normalizedMinScore, normalizedMaxScore),
    limit: Math.max(1, Math.min(100, Math.floor(merged.limit))),
    offset: Math.max(0, Math.floor(merged.offset)),
  };
}

function toSearchParams(state: TopStocksQueryState) {
  const searchParams = new URLSearchParams({
    limit: String(state.limit),
    offset: String(state.offset),
    favoritesOnly: String(state.favoritesOnly),
    minScore: String(state.minScore),
    maxScore: String(state.maxScore),
    sector: state.sector,
    valuationStyle: state.valuationStyle,
  });

  return searchParams;
}

type UseTopStocksViewStateOptions = {
  initialQuery?: TopStocksViewInitialQuery;
};

export function useTopStocksViewState(options: UseTopStocksViewStateOptions = {}) {
  const router = useRouter();
  const pathname = usePathname() || "/top-stocks";

  const initialState = useMemo(
    () => normalizeTopStocksQueryState(options.initialQuery),
    [options.initialQuery],
  );

  const [draftFilters, setDraftFilters] = useState<TopStocksFilters>({
    favoritesOnly: initialState.favoritesOnly,
    minScore: initialState.minScore,
    maxScore: initialState.maxScore,
    sector: initialState.sector,
    valuationStyle: initialState.valuationStyle,
  });
  const [queryState, setQueryState] = useState<TopStocksQueryState>(initialState);

  function syncUrl(nextState: TopStocksQueryState) {
    const nextSearch = toSearchParams(nextState);
    router.replace(`${pathname}?${nextSearch.toString()}` as Route, { scroll: false });
  }

  function updateMinScore(nextMin: number) {
    const min = clampScore(nextMin);
    setDraftFilters((prev) => ({
      ...prev,
      minScore: Math.min(min, prev.maxScore),
    }));
  }

  function updateMaxScore(nextMax: number) {
    const max = clampScore(nextMax);
    setDraftFilters((prev) => ({
      ...prev,
      maxScore: Math.max(max, prev.minScore),
    }));
  }

  function applyFilters() {
    const nextState = normalizeTopStocksQueryState({
      ...queryState,
      ...draftFilters,
      limit: 50,
      offset: 0,
    });
    setQueryState(nextState);
    syncUrl(nextState);
  }

  function loadNext(canLoadMore: boolean) {
    if (!canLoadMore) return;

    const nextState = normalizeTopStocksQueryState({
      ...queryState,
      limit: queryState.limit + 50,
      offset: 0,
    });
    setQueryState(nextState);
    syncUrl(nextState);
  }

  function cycleSector(sectors: string[]) {
    if (sectors.length === 0) return;

    const currentIndex = sectors.findIndex((sector) => sector === draftFilters.sector);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % sectors.length : 0;
    setDraftFilters((prev) => ({ ...prev, sector: sectors[nextIndex] ?? "all" }));
  }

  return {
    draftFilters,
    queryState,
    setDraftFilters,
    updateMinScore,
    updateMaxScore,
    applyFilters,
    loadNext,
    cycleSector,
  };
}
