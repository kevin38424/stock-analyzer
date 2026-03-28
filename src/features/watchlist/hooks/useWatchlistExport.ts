"use client";

import { useCallback } from "react";
import type { WatchlistRow } from "@/features/watchlist/types/watchlist";

type ExportResult = {
  filename: string;
  csv: string;
};

function toCsvValue(value: string | number): string {
  const normalized = String(value).replaceAll('"', '""');
  return `"${normalized}"`;
}

function buildWatchlistCsv(rows: WatchlistRow[]): string {
  const header = [
    "Ticker",
    "Company",
    "Sector",
    "Score",
    "DeltaScore",
    "Price",
    "ChangePercent",
    "Recommendation",
    "Thesis",
  ];

  const lines = rows.map((row) =>
    [
      row.ticker,
      row.companyName,
      row.sector,
      row.score,
      row.deltaScore,
      row.price.toFixed(2),
      row.changePercent.toFixed(2),
      row.recommendation,
      row.thesis,
    ]
      .map((value) => toCsvValue(value))
      .join(","),
  );

  return [header.map((value) => toCsvValue(value)).join(","), ...lines].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useWatchlistExport() {
  const exportRows = useCallback((rows: WatchlistRow[]): ExportResult => {
    const now = new Date();
    const stamp = now.toISOString().replaceAll(":", "-").slice(0, 19);
    const filename = `watchlist-${stamp}.csv`;
    const csv = buildWatchlistCsv(rows);

    if (typeof window !== "undefined") {
      downloadCsv(filename, csv);
    }

    return { filename, csv };
  }, []);

  return {
    exportRows,
  };
}

export { buildWatchlistCsv };
