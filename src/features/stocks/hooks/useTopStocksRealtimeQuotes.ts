"use client";

import { useMemo, useState } from "react";
import type { TopStocksRow } from "@/features/stocks/types/top-stocks";

export type TopStocksQuotePatch = {
  ticker: string;
  price?: number;
  changePercent?: number;
};

export function useTopStocksRealtimeQuotes(rows: TopStocksRow[]) {
  const [patches, setPatches] = useState<Record<string, TopStocksQuotePatch>>({});

  const rowsWithRealtimeQuotes = useMemo(
    () =>
      rows.map((row) => {
        const patch = patches[row.ticker.toUpperCase()];
        if (!patch) return row;

        return {
          ...row,
          price: patch.price ?? row.price,
          changePercent: patch.changePercent ?? row.changePercent,
        };
      }),
    [rows, patches],
  );

  function applyQuotePatch(patch: TopStocksQuotePatch) {
    const ticker = patch.ticker.trim().toUpperCase();
    if (!ticker) return;

    setPatches((prev) => ({
      ...prev,
      [ticker]: {
        ...prev[ticker],
        ...patch,
        ticker,
      },
    }));
  }

  function clearQuotePatches() {
    setPatches({});
  }

  return {
    rowsWithRealtimeQuotes,
    applyQuotePatch,
    clearQuotePatches,
    hasQuotePatches: Object.keys(patches).length > 0,
  };
}
