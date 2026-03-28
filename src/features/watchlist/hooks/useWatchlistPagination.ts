"use client";

import { useEffect, useMemo, useState } from "react";
import type { WatchlistRow } from "@/features/watchlist/types/watchlist";

type UseWatchlistPaginationOptions = {
  rows: WatchlistRow[];
  totalTracked?: number;
  pageSize?: number;
  resetKey?: string;
};

export function useWatchlistPagination({ rows, totalTracked, pageSize = 4, resetKey }: UseWatchlistPaginationOptions) {
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 4;
  const totalPages = Math.max(1, Math.ceil(rows.length / safePageSize));
  const [page, setPage] = useState(1);

  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * safePageSize;
    return rows.slice(start, start + safePageSize);
  }, [currentPage, rows, safePageSize]);

  function nextPage() {
    setPage((previous) => Math.min(previous + 1, totalPages));
  }

  function prevPage() {
    setPage((previous) => Math.max(previous - 1, 1));
  }

  function resetPage() {
    setPage(1);
  }

  useEffect(() => {
    resetPage();
  }, [resetKey]);

  return {
    pagedRows,
    currentPage,
    totalPages,
    totalTracked: totalTracked ?? rows.length,
    canGoPrev: currentPage > 1,
    canGoNext: currentPage < totalPages,
    nextPage,
    prevPage,
    resetPage,
  };
}
