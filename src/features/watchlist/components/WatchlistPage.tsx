"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Download, EllipsisVertical, Plus } from "lucide-react";
import { type WatchlistRecommendation, type WatchlistSegment, type WatchlistSortBy } from "@/features/watchlist/types/watchlist";
import { useWatchlistPage } from "@/features/watchlist/hooks/useWatchlistPage";
import {
  useWatchlistViewState,
  type WatchlistViewQuery,
} from "@/features/watchlist/hooks/useWatchlistViewState";
import { useWatchlistPagination } from "@/features/watchlist/hooks/useWatchlistPagination";
import { useWatchlistExport } from "@/features/watchlist/hooks/useWatchlistExport";
import { useWatchlistRealtimeMock } from "@/features/watchlist/hooks/useWatchlistRealtimeMock";
import { AppSidebar, AppTopbar, appLayoutClasses, appTypographyClasses } from "@/features/shared";

type WatchlistPageProps = {
  initialQuery?: Partial<WatchlistViewQuery>;
};

const segmentButtonClasses = {
  active: "rounded-full border border-blue-400/80 bg-slate-100 px-5 py-2 text-sm font-semibold text-blue-950",
  idle: "rounded-full border border-slate-700 bg-slate-900/70 px-5 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800/80",
};

const fallbackSegments: Array<{ id: WatchlistSegment; label: string }> = [
  { id: "all_holdings", label: "All Holdings" },
  { id: "tech_growth", label: "Tech Growth" },
  { id: "dividends", label: "Dividends" },
  { id: "speculative", label: "Speculative" },
];

const sortOptions: Array<{ id: WatchlistSortBy; label: string }> = [
  { id: "score_desc", label: "Score (High-Low)" },
  { id: "score_asc", label: "Score (Low-High)" },
  { id: "delta_desc", label: "Delta (High-Low)" },
  { id: "delta_asc", label: "Delta (Low-High)" },
  { id: "price_desc", label: "Price (High-Low)" },
  { id: "price_asc", label: "Price (Low-High)" },
];

function recommendationBadgeClass(recommendation: WatchlistRecommendation): string {
  if (recommendation === "STRONG BUY") return "border-emerald-500/40 bg-emerald-500/15 text-emerald-300";
  if (recommendation === "BUY") return "border-cyan-500/40 bg-cyan-500/15 text-cyan-300";
  if (recommendation === "HOLD") return "border-indigo-400/30 bg-indigo-400/15 text-indigo-200";
  if (recommendation === "AVOID") return "border-amber-500/40 bg-amber-500/15 text-amber-300";
  return "border-slate-600 bg-slate-700/30 text-slate-300";
}

function scoreBarClass(score: number): string {
  if (score >= 80) return "from-blue-500 to-emerald-300";
  if (score >= 60) return "from-sky-500 to-cyan-300";
  return "from-amber-300 to-orange-400";
}

export function WatchlistPage({ initialQuery }: WatchlistPageProps) {
  const { queryState, setSegment, cycleSortBy } = useWatchlistViewState({ initialQuery });

  const { data, isLoading, isFetching } = useWatchlistPage({
    segment: queryState.segment,
    sortBy: queryState.sortBy,
  });

  const lastResolvedDataRef = useRef<typeof data>(undefined);

  useEffect(() => {
    if (data) {
      lastResolvedDataRef.current = data;
    }
  }, [data]);

  const stableData = data ?? lastResolvedDataRef.current;
  const segments = stableData?.filters.segments ?? fallbackSegments;
  const rows = stableData?.rows ?? [];
  const kpis = stableData?.kpis;
  const isInitialLoading = isLoading && !stableData;
  const isTableLoading = (isLoading && !data) || isFetching;
  const selectedSortLabel = sortOptions.find((option) => option.id === queryState.sortBy)?.label ?? "Score (High-Low)";
  const { exportRows } = useWatchlistExport();
  const pagination = useWatchlistPagination({
    rows,
    totalTracked: stableData?.totalTracked,
    resetKey: `${queryState.segment}:${queryState.sortBy}`,
  });

  useWatchlistRealtimeMock({
    symbols: rows.map((row) => row.ticker),
    enabled: process.env.NEXT_PUBLIC_ENABLE_WATCHLIST_MOCK_STREAM === "true",
    intervalMs: 5000,
  });

  function onCycleSort() {
    cycleSortBy(sortOptions.map((option) => option.id));
  }

  function onExportWatchlist() {
    exportRows(rows);
  }

  return (
    <main className={appLayoutClasses.page}>
      <div className={appLayoutClasses.shell}>
        <AppSidebar activePage="watchlist" />

        <section className="relative flex min-h-screen flex-col">
          <AppTopbar />

          <div className={`${appLayoutClasses.content} pb-24`}>
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-2xl">
                <h1 className={appTypographyClasses.pageTitle}>{stableData?.summary.title ?? "My Watchlist"}</h1>
                <p className={appTypographyClasses.pageSubtitle}>
                  Real-time performance tracking and proprietary conviction scores.
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
                {[
                  { label: "AVG SCORE", value: kpis?.averageScore.value ?? "--", detail: kpis?.averageScore.detail },
                  { label: "TOP PICK", value: kpis?.topPick.value ?? "--", detail: kpis?.topPick.detail },
                  { label: "BIG UPGRADE", value: kpis?.bigUpgrade.value ?? "--", detail: kpis?.bigUpgrade.detail },
                  { label: "AT RISK", value: kpis?.atRisk.value ?? "--", detail: kpis?.atRisk.detail },
                ].map((kpi) => (
                  <article
                    key={kpi.label}
                    className="min-w-[170px] rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4"
                  >
                    <p className="text-xs font-semibold tracking-[0.15em] text-slate-400">{kpi.label}</p>
                    {isInitialLoading ? (
                      <div className="mt-2 space-y-2">
                        <div className="app-skeleton h-8 w-20" />
                        <div className="app-skeleton h-4 w-16" />
                      </div>
                    ) : (
                      <div className="mt-2 flex items-end gap-2">
                        <p className="app-data text-3xl font-semibold leading-none">{kpi.value}</p>
                        {kpi.detail ? <p className="mb-1 text-sm font-semibold text-emerald-300">{kpi.detail}</p> : null}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {segments.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSegment(item.id)}
                    className={item.id === queryState.segment ? segmentButtonClasses.active : segmentButtonClasses.idle}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400">SORT BY:</p>
                <button
                  type="button"
                  onClick={onCycleSort}
                  className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold"
                >
                  {selectedSortLabel}
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={onExportWatchlist}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-900/70 text-slate-300"
                  aria-label="Export watchlist"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="hidden grid-cols-[2fr_1fr_1.2fr_1fr_1fr_1.6fr_36px] gap-4 border-b border-slate-800/80 px-6 py-5 text-sm font-semibold tracking-[0.12em] text-slate-400 md:grid">
                <p>COMPANY / TICKER</p>
                <p>SECTOR</p>
                <p>SCORE / DELTA</p>
                <p>PRICE / CHANGE</p>
                <p>RECOMMENDATION</p>
                <p>PRIMARY THESIS</p>
                <p aria-hidden="true" />
              </div>

              <div className={isTableLoading ? "relative" : undefined}>
                {isTableLoading ? (
                  <div className="pointer-events-none absolute inset-0 z-10 bg-slate-950/15 backdrop-blur-[1px]" aria-hidden="true" />
                ) : null}
                <div className="divide-y divide-slate-800/70">
                  {isInitialLoading && pagination.pagedRows.length === 0 ? (
                    <div className="space-y-4 px-6 py-5">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={`watchlist-skeleton-${index}`} className="grid gap-4 md:grid-cols-[2fr_1fr_1.2fr_1fr_1fr_1.6fr_36px]">
                          <div>
                            <div className="app-skeleton h-7 w-40" />
                            <div className="app-skeleton mt-2 h-4 w-16" />
                          </div>
                          <div className="app-skeleton h-6 w-24 rounded-md" />
                          <div className="app-skeleton h-6 w-32" />
                          <div className="app-skeleton h-6 w-24" />
                          <div className="app-skeleton h-6 w-24 rounded-full" />
                          <div className="app-skeleton h-5 w-full" />
                          <div className="app-skeleton h-6 w-6" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {pagination.pagedRows.map((row) => (
                    <article
                      key={row.ticker}
                      className="grid gap-4 px-6 py-5 md:grid-cols-[2fr_1fr_1.2fr_1fr_1fr_1.6fr_36px] md:items-center"
                    >
                      <div>
                        <Link
                          href={`/stocks/${encodeURIComponent(row.ticker)}`}
                          className="text-2xl font-semibold leading-tight"
                        >
                          {row.companyName}
                        </Link>
                        <p className="mt-1 text-sm font-semibold tracking-wider text-slate-400">{row.ticker}</p>
                      </div>

                      <div>
                        <span className="inline-flex rounded-md bg-slate-700/70 px-3 py-1 text-xs font-semibold tracking-wide text-slate-200">
                          {row.sector.toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 rounded-full bg-slate-700">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${scoreBarClass(row.score)}`}
                              style={{ width: `${row.score}%` }}
                            />
                          </div>
                          <p className="app-data text-2xl font-semibold">{row.score}</p>
                          <p className={`text-sm font-semibold ${row.deltaScore >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                            {row.deltaScore >= 0 ? `+${row.deltaScore}` : row.deltaScore}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="app-data text-2xl font-semibold">${row.price.toFixed(2)}</p>
                        <p className={`${row.changePercent >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                          {row.changePercent >= 0 ? "+" : ""}
                          {row.changePercent.toFixed(2)}%
                        </p>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-[0.12em] ${recommendationBadgeClass(
                            row.recommendation,
                          )}`}
                        >
                          {row.recommendation}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-sm text-slate-200 sm:text-base">{row.thesis}</p>

                      <button
                        type="button"
                        className="text-slate-400 transition hover:text-slate-200"
                        aria-label={`Actions for ${row.ticker}`}
                      >
                        <EllipsisVertical size={18} />
                      </button>
                    </article>
                  ))}

                  {pagination.pagedRows.length === 0 ? (
                    <div className="px-6 py-10 text-center text-slate-400">No watchlist items found for this filter.</div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4 text-sm text-slate-400">
                <p>
                  Showing {pagination.pagedRows.length} of {pagination.totalTracked} assets
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={pagination.prevPage}
                    disabled={!pagination.canGoPrev}
                    className="rounded p-1 text-slate-400 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <p className="min-w-8 text-center">{pagination.currentPage}</p>
                  <button
                    type="button"
                    onClick={pagination.nextPage}
                    disabled={!pagination.canGoNext}
                    className="rounded p-1 text-slate-400 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </section>

            <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs font-semibold tracking-[0.14em] text-slate-500">
              <div className="flex flex-wrap gap-6">
                <p>DOCUMENTATION</p>
                <p>METHODOLOGY</p>
                <p>API STATUS</p>
              </div>
              <p>C 2026 SCOREENGINE PREMIUM ANALYTICS. ALL DATA DELAYED 15M.</p>
            </footer>
          </div>

          <button
            type="button"
            className="fixed bottom-10 right-8 hidden h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 text-3xl text-slate-100 shadow-[0_16px_45px_rgba(37,99,235,0.45)] md:flex"
            aria-label="Add stock to watchlist"
          >
            <Plus size={30} />
          </button>
        </section>
      </div>
    </main>
  );
}
