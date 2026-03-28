"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, ChevronDown, EllipsisVertical, Lightbulb } from "lucide-react";
import Link from "next/link";
import { AppSidebar, AppTopbar, appLayoutClasses, appTypographyClasses } from "@/features/shared";
import { useTopStocksPage } from "@/features/stocks/hooks/useTopStocksPage";
import {
  useTopStocksViewState,
  type TopStocksViewInitialQuery,
} from "@/features/stocks/hooks/useTopStocksViewState";
import { useTopStocksRowActions } from "@/features/stocks/hooks/useTopStocksRowActions";
import { useTopStocksRealtimeQuotes } from "@/features/stocks/hooks/useTopStocksRealtimeQuotes";
import type { TopStocksRow, ValuationStyle } from "@/features/stocks/types/top-stocks";

const scoreMin = 0;
const scoreMax = 100;
const topStocksPageTitle = "Top Stocks";
const topStocksPageSubtitle =
  "Ranked by proprietary ScoreEngine analytics combining fundamentals, momentum, and institutional sentiment.";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatChange(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function recommendationAccent(recommendation: TopStocksRow["recommendation"]) {
  if (recommendation === "BUY") return "text-emerald-300";
  if (recommendation === "HOLD") return "text-slate-300";
  if (recommendation === "WATCH") return "text-amber-300";
  return "text-rose-300";
}

function ProgressBar({ value, accent }: { value: number; accent: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-[#3a4b75]">
      <div className={`h-1.5 rounded-full ${accent}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

type RankingRowProps = {
  row: TopStocksRow;
  isFavorite: boolean;
  isPending: boolean;
  isMenuOpen: boolean;
  onToggleFavorite: () => void;
  onToggleMenu: () => void;
  onCopyTicker: () => void;
};

function RankingRow({
  row,
  isFavorite,
  isPending,
  isMenuOpen,
  onToggleFavorite,
  onToggleMenu,
  onCopyTicker,
}: RankingRowProps) {
  const isPositive = row.changePercent >= 0;

  return (
    <article className="relative grid items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/75 px-4 py-4 sm:grid-cols-[56px_70px_1.3fr_1fr_0.8fr_28px_28px] sm:px-6">
      <p className="app-data text-lg font-semibold text-slate-400">#{row.rank}</p>

      <Link
        href={`/stocks/${encodeURIComponent(row.ticker)}`}
        className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#152447] text-lg font-semibold text-slate-300"
      >
        {row.ticker.slice(0, 1)}
      </Link>

      <Link href={`/stocks/${encodeURIComponent(row.ticker)}`}>
        <p className="text-lg font-semibold leading-tight text-slate-100">{row.companyName}</p>
        <p className="text-sm text-slate-400">{row.sector} • {row.industry}</p>
      </Link>

      <div className="min-w-40">
        <p className={`app-data text-2xl font-semibold ${recommendationAccent(row.recommendation)}`}>
          {row.score} <span className="text-sm tracking-wide">{row.recommendation}</span>
        </p>
        <div className="mt-2">
          <ProgressBar
            value={row.score}
            accent={
              row.recommendation === "BUY"
                ? "bg-emerald-300"
                : row.recommendation === "HOLD"
                  ? "bg-slate-300"
                  : row.recommendation === "WATCH"
                    ? "bg-amber-300"
                    : "bg-rose-300"
            }
          />
        </div>
      </div>

      <div>
        <p className="app-data text-xl font-semibold text-slate-100">{formatPrice(row.price)}</p>
        <p className={`text-sm ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>{formatChange(row.changePercent)}</p>
      </div>

      <button
        type="button"
        onClick={onToggleFavorite}
        disabled={isPending}
        className="text-slate-400 transition hover:text-slate-200 disabled:opacity-60"
        aria-label="Bookmark stock"
      >
        <Bookmark size={20} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      <button
        type="button"
        onClick={onToggleMenu}
        className="text-slate-400 transition hover:text-slate-200"
        aria-label="More actions"
      >
        <EllipsisVertical size={20} />
      </button>

      {isMenuOpen ? (
        <div className="absolute right-4 top-12 z-10 w-44 rounded-md border border-slate-700 bg-[#0f1a36] p-1 shadow-lg">
          <Link
            href={`/stocks/${encodeURIComponent(row.ticker)}`}
            className="block rounded px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/50"
          >
            View details
          </Link>
          <button
            type="button"
            onClick={onCopyTicker}
            className="block w-full rounded px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/50"
          >
            Copy ticker
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            className="block w-full rounded px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700/50"
          >
            {isFavorite ? "Remove favorite" : "Add favorite"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

type TopStocksViewProps = {
  initialQuery?: TopStocksViewInitialQuery;
  userId?: string | null;
};

type ViewMode = "card" | "table";

export function TopStocksView({ initialQuery, userId = null }: TopStocksViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [isSectorMenuOpen, setIsSectorMenuOpen] = useState(false);
  const [activeScoreThumb, setActiveScoreThumb] = useState<"min" | "max" | null>(null);
  const sectorMenuRef = useRef<HTMLDivElement | null>(null);
  const scoreRangeRef = useRef<HTMLDivElement | null>(null);
  const {
    draftFilters,
    queryState,
    setDraftFilters,
    updateMinScore,
    updateMaxScore,
    applyFilters,
    loadNext,
  } = useTopStocksViewState({ initialQuery });

  const { data, isLoading, isFetching, isError, error, refetch } = useTopStocksPage({
    ...queryState,
    userId,
  });

  const sectors = useMemo(() => {
    if (!data?.filterMetadata.sectors?.length) return ["all"];
    return data.filterMetadata.sectors;
  }, [data?.filterMetadata.sectors]);

  const valuationStyles: ValuationStyle[] = data?.filterMetadata.valuationStyles ?? ["growth", "value", "income"];

  const featured = data?.featured;
  const { rowsWithRealtimeQuotes: rows } = useTopStocksRealtimeQuotes(data?.rows ?? []);
  const canLoadMore = data?.page.hasMore ?? false;
  const isInitialLoading = isLoading && !data;
  const currentSectorLabel = draftFilters.sector === "all" ? "All Sectors" : draftFilters.sector;
  const minThumbPercent = ((draftFilters.minScore - scoreMin) / (scoreMax - scoreMin)) * 100;
  const maxThumbPercent = ((draftFilters.maxScore - scoreMin) / (scoreMax - scoreMin)) * 100;
  const {
    getRowFavorite,
    isPending,
    toggleFavorite,
    activeMenuTicker,
    toggleRowMenu,
    closeRowMenu,
    copyTicker,
    feedbackMessage,
    clearFeedback,
  } = useTopStocksRowActions({
    rows,
    userId,
  });

  useEffect(() => {
    if (!isSectorMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!sectorMenuRef.current?.contains(event.target as Node)) {
        setIsSectorMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSectorMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSectorMenuOpen]);

  useEffect(() => {
    if (!activeScoreThumb) return;

    function updateScoreFromClientX(clientX: number) {
      const sliderRect = scoreRangeRef.current?.getBoundingClientRect();
      if (!sliderRect || sliderRect.width <= 0) return;

      const relativeX = Math.min(sliderRect.width, Math.max(0, clientX - sliderRect.left));
      const ratio = relativeX / sliderRect.width;
      const nextScore = Math.round(scoreMin + ratio * (scoreMax - scoreMin));

      if (activeScoreThumb === "min") {
        updateMinScore(nextScore);
      } else {
        updateMaxScore(nextScore);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      updateScoreFromClientX(event.clientX);
    }

    function handlePointerUp() {
      setActiveScoreThumb(null);
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [activeScoreThumb, updateMaxScore, updateMinScore]);

  function startScoreDrag(clientX: number) {
    const sliderRect = scoreRangeRef.current?.getBoundingClientRect();
    if (!sliderRect || sliderRect.width <= 0) return;

    const relativeX = Math.min(sliderRect.width, Math.max(0, clientX - sliderRect.left));
    const ratio = relativeX / sliderRect.width;
    const targetScore = scoreMin + ratio * (scoreMax - scoreMin);

    const minDistance = Math.abs(targetScore - draftFilters.minScore);
    const maxDistance = Math.abs(targetScore - draftFilters.maxScore);
    const nextActiveThumb = minDistance <= maxDistance ? "min" : "max";
    setActiveScoreThumb(nextActiveThumb);

    if (nextActiveThumb === "min") {
      updateMinScore(Math.round(targetScore));
    } else {
      updateMaxScore(Math.round(targetScore));
    }
  }

  return (
    <main className={appLayoutClasses.page}>
      <div className={appLayoutClasses.shell}>
        <AppSidebar activePage="top-stocks" />

        <section className="flex min-h-screen flex-col">
          <AppTopbar searchPlaceholder="Search markets, tickers, or sectors..." />

          <div className={appLayoutClasses.content}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className={appTypographyClasses.pageTitle}>{topStocksPageTitle}</h1>
                <p className={appTypographyClasses.pageSubtitle}>{topStocksPageSubtitle}</p>
              </div>

              <div className="mt-2 inline-flex rounded-md border border-slate-700 bg-slate-900/75 p-1 text-sm text-slate-300 sm:text-base">
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={[
                    "rounded-md px-4 py-2",
                    viewMode === "card" ? "bg-slate-700/70 text-slate-100" : "hover:bg-slate-700/70",
                  ].join(" ")}
                >
                  Card View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={[
                    "rounded-md px-4 py-2",
                    viewMode === "table" ? "bg-slate-700/70 text-slate-100" : "hover:bg-slate-700/70",
                  ].join(" ")}
                >
                  Table View
                </button>
              </div>
            </div>

            {isError ? (
              <section className="mt-6 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4">
                <p className="text-sm text-rose-100">Unable to load top stocks. {error?.message ?? "Please try again."}</p>
                <button
                  type="button"
                  onClick={() => {
                    void refetch();
                  }}
                  className="mt-3 rounded-md bg-rose-500/20 px-3 py-2 text-sm text-rose-100 hover:bg-rose-500/30"
                >
                  Retry
                </button>
              </section>
            ) : null}
            {feedbackMessage ? (
              <section className="mt-3 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                <div className="flex items-center justify-between gap-4">
                  <span>{feedbackMessage}</span>
                  <button type="button" onClick={clearFeedback} className="text-cyan-200/80 hover:text-cyan-100">
                    Dismiss
                  </button>
                </div>
              </section>
            ) : null}

            <div className="mt-6 grid gap-5 xl:grid-cols-[340px_1fr]">
              <div className="space-y-5">
                <section className={appLayoutClasses.panel}>
                  <h2 className={appTypographyClasses.sectionTitle}>Filter Parameters</h2>

                  <div className="mt-5 rounded-lg bg-[#152447] p-3">
                    <div className="flex items-center justify-between text-base">
                      <span>Favorites Only</span>
                      <button
                        type="button"
                        onClick={() => setDraftFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))}
                        className={`relative inline-flex h-6 w-11 rounded-full ${draftFilters.favoritesOnly ? "bg-blue-500" : "bg-[#3a4b75]"}`}
                      >
                        <span
                          className={`absolute top-[2px] h-5 w-5 rounded-full bg-slate-200 transition ${draftFilters.favoritesOnly ? "left-[22px]" : "left-[2px]"}`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <p>SCORE RANGE</p>
                      <p className="rounded bg-slate-700/70 px-2 py-0.5">
                        {draftFilters.minScore} - {draftFilters.maxScore}
                      </p>
                    </div>
                    <div
                      ref={scoreRangeRef}
                      className="relative mt-3 h-8 cursor-pointer touch-none"
                      onPointerDown={(event) => {
                        startScoreDrag(event.clientX);
                      }}
                    >
                      <div className="absolute left-0 right-0 top-3 h-1.5 rounded-full bg-[#3a4b75]">
                        <div
                          className="relative h-1.5 rounded-full bg-[#38d9ff]"
                          style={{
                            marginLeft: `${minThumbPercent}%`,
                            width: `${Math.max(0, maxThumbPercent - minThumbPercent)}%`,
                          }}
                        />
                        <span
                          className="absolute top-0 h-5 w-5 -translate-x-1/2 -translate-y-[7px] rounded-full bg-slate-200"
                          style={{ left: `${minThumbPercent}%` }}
                        />
                        <span
                          className="absolute top-0 h-5 w-5 -translate-x-1/2 -translate-y-[7px] rounded-full bg-slate-200"
                          style={{ left: `${maxThumbPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="sr-only">
                      <label>
                        Minimum score
                        <input
                          type="range"
                          min={scoreMin}
                          max={scoreMax}
                          value={draftFilters.minScore}
                          onChange={(event) => updateMinScore(Number(event.target.value))}
                        />
                      </label>
                      <label>
                        Maximum score
                        <input
                          type="range"
                          min={scoreMin}
                          max={scoreMax}
                          value={draftFilters.maxScore}
                          onChange={(event) => updateMaxScore(Number(event.target.value))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    <div ref={sectorMenuRef} className="relative">
                      <p className="text-sm text-slate-300">MARKET SECTOR</p>
                      <button
                        type="button"
                        onClick={() => setIsSectorMenuOpen((prev) => !prev)}
                        className="mt-2 flex w-full items-center justify-between rounded-md border border-slate-700 bg-[#152447] px-4 py-3 text-base"
                      >
                        {currentSectorLabel}
                        <ChevronDown size={18} />
                      </button>
                      {isSectorMenuOpen ? (
                        <div className="absolute left-0 right-0 z-10 mt-1 max-h-56 overflow-auto rounded-md border border-slate-700 bg-[#0f1a36] p-1 shadow-lg">
                          {sectors.map((sector) => (
                            <button
                              key={sector}
                              type="button"
                              onClick={() => {
                                setDraftFilters((prev) => ({ ...prev, sector }));
                                setIsSectorMenuOpen(false);
                              }}
                              className={[
                                "block w-full rounded px-3 py-2 text-left text-sm",
                                draftFilters.sector === sector
                                  ? "bg-slate-700/70 text-slate-100"
                                  : "text-slate-300 hover:bg-slate-700/50",
                              ].join(" ")}
                            >
                              {sector === "all" ? "All Sectors" : sector}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-sm text-slate-300">VALUATION STYLE</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {valuationStyles.map((style) => (
                          <button
                            type="button"
                            key={style}
                            onClick={() => setDraftFilters((prev) => ({ ...prev, valuationStyle: style }))}
                            className={[
                              "rounded-md border px-4 py-2 text-sm capitalize",
                              draftFilters.valuationStyle === style
                                ? "border-blue-500/60 bg-slate-700/70 text-slate-100"
                                : "border-slate-700 bg-slate-900/70 text-slate-300",
                            ].join(" ")}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSectorMenuOpen(false);
                      applyFilters();
                    }}
                    disabled={isFetching}
                    className="mt-8 w-full rounded-md bg-[#1b63ff] px-4 py-3 text-lg font-semibold text-slate-100 disabled:opacity-60"
                  >
                    Apply Analysis
                  </button>
                </section>

                <section className={appLayoutClasses.panel}>
                  <Lightbulb className="text-amber-300" size={20} />
                  <h3 className="mt-3 text-xl font-semibold">Algorithm Note</h3>
                  {isInitialLoading ? (
                    <div className="mt-2 space-y-2">
                      <div className="app-skeleton h-4 w-full" />
                      <div className="app-skeleton h-4 w-5/6" />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                      {data?.algorithmNote ??
                        "Currently prioritizing momentum-heavy assets due to recent macro shifts in core inflation data."}
                    </p>
                  )}
                </section>
              </div>

              <div className="space-y-5">
                <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/75">
                  <div className="grid lg:grid-cols-[280px_1fr]">
                    <div className="flex flex-col items-center justify-center gap-2 border-b border-slate-800 bg-[#152447] p-8 lg:border-b-0 lg:border-r">
                      <p className="text-sm tracking-[0.35em] text-slate-400">RANK #{featured?.rank ?? 1}</p>
                      {isInitialLoading ? (
                        <>
                          <div className="app-skeleton h-20 w-24" />
                          <div className="app-skeleton h-8 w-28 rounded-full" />
                        </>
                      ) : (
                        <>
                          <p className="app-data text-8xl font-semibold text-emerald-300">{featured?.score ?? 0}</p>
                          <span className="rounded-full bg-emerald-500/15 px-4 py-1 text-sm font-semibold tracking-[0.2em] text-emerald-300">
                            {featured?.recommendation ?? "HOLD"}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          {isInitialLoading ? (
                            <>
                              <div className="app-skeleton h-10 w-72 max-w-full" />
                              <div className="app-skeleton mt-2 h-6 w-64 max-w-full" />
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <Link href={`/stocks/${encodeURIComponent(featured?.ticker ?? "")}`} className="text-4xl font-semibold">
                                  {featured?.companyName ?? "No ranking data"}
                                </Link>
                                <Link
                                  href={`/stocks/${encodeURIComponent(featured?.ticker ?? "")}`}
                                  className="rounded bg-slate-700/70 px-2 py-1 text-base text-slate-300"
                                >
                                  {featured?.ticker ?? "N/A"}
                                </Link>
                              </div>
                              <p className="mt-2 text-xl text-slate-300">
                                {(featured?.sector ?? "Unknown")} • {(featured?.industry ?? "Unknown")}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="text-right">
                          {isInitialLoading ? (
                            <>
                              <div className="app-skeleton h-10 w-36" />
                              <div className="app-skeleton mt-2 h-6 w-24" />
                            </>
                          ) : (
                            <>
                              <p className="app-data text-4xl font-semibold">{formatPrice(featured?.price ?? 0)}</p>
                              <p className={`mt-1 text-xl ${(featured?.changePercent ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                                {formatChange(featured?.changePercent ?? 0)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-4">
                        <div>
                          <p className="text-sm text-slate-400">FUNDAMENTALS</p>
                          <div className="mt-2">
                            <ProgressBar value={featured?.factors.fundamentals ?? 0} accent="bg-emerald-300" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">MOMENTUM</p>
                          <div className="mt-2">
                            <ProgressBar value={featured?.factors.momentum ?? 0} accent="bg-emerald-400" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">SENTIMENT</p>
                          <div className="mt-2">
                            <ProgressBar value={featured?.factors.sentiment ?? 0} accent="bg-slate-300" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">VALUE SCORE</p>
                          <div className="mt-2">
                            <ProgressBar value={featured?.factors.valueScore ?? 0} accent="bg-amber-300" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 rounded-md bg-[#152447] p-4 text-base leading-relaxed text-slate-200">
                        <span className="font-semibold">Why it ranks:</span> {featured?.whyItRanks ?? "No narrative available."}
                      </div>
                    </div>
                  </div>
                </section>

                {viewMode === "card" ? (
                  <section className="space-y-4">
                    {isInitialLoading ? (
                      Array.from({ length: 6 }).map((_, index) => (
                        <article key={`top-stock-skeleton-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/75 px-4 py-4 sm:px-6">
                          <div className="grid items-center gap-3 sm:grid-cols-[56px_70px_1.3fr_1fr_0.8fr_28px_28px]">
                            <div className="app-skeleton h-6 w-10" />
                            <div className="app-skeleton h-12 w-12 rounded-sm" />
                            <div>
                              <div className="app-skeleton h-6 w-48 max-w-full" />
                              <div className="app-skeleton mt-2 h-4 w-32" />
                            </div>
                            <div className="app-skeleton h-8 w-28" />
                            <div className="app-skeleton h-8 w-24" />
                            <div className="app-skeleton h-6 w-6 rounded-full" />
                            <div className="app-skeleton h-6 w-6 rounded-full" />
                          </div>
                        </article>
                      ))
                    ) : (
                      rows.map((row) => (
                        <RankingRow
                          key={`${row.rank}-${row.ticker}`}
                          row={row}
                          isFavorite={getRowFavorite(row)}
                          isPending={isPending(row.ticker)}
                          isMenuOpen={activeMenuTicker === row.ticker.toUpperCase()}
                          onToggleFavorite={() => {
                            void toggleFavorite(row);
                          }}
                          onToggleMenu={() => toggleRowMenu(row.ticker)}
                          onCopyTicker={() => {
                            void copyTicker(row.ticker);
                            closeRowMenu();
                          }}
                        />
                      ))
                    )}
                    {!isLoading && rows.length === 0 ? (
                      <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
                        No stocks matched the current filters.
                      </article>
                    ) : null}
                  </section>
                ) : (
                  <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/75">
                    <table className="min-w-full text-left">
                      <thead className="border-b border-slate-800 text-xs tracking-wide text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Rank</th>
                          <th className="px-4 py-3">Company</th>
                          <th className="px-4 py-3">Score</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={`${row.rank}-${row.ticker}`} className="border-b border-slate-800/70 last:border-b-0">
                            <td className="px-4 py-3 text-sm text-slate-300">#{row.rank}</td>
                            <td className="px-4 py-3">
                              <Link href={`/stocks/${encodeURIComponent(row.ticker)}`} className="font-semibold text-slate-100">
                                {row.companyName}
                              </Link>
                              <p className="text-xs text-slate-400">
                                {row.ticker} • {row.sector} • {row.industry}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-200">
                              <span className={recommendationAccent(row.recommendation)}>
                                {row.score} {row.recommendation}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-200">
                              {formatPrice(row.price)}
                              <p className={row.changePercent >= 0 ? "text-emerald-300" : "text-rose-300"}>
                                {formatChange(row.changePercent)}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void toggleFavorite(row);
                                  }}
                                  className="text-slate-400 hover:text-slate-200"
                                >
                                  <Bookmark size={18} fill={getRowFavorite(row) ? "currentColor" : "none"} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void copyTicker(row.ticker);
                                  }}
                                  className="text-xs text-slate-300 hover:text-slate-100"
                                >
                                  Copy
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!isLoading && rows.length === 0 ? (
                      <article className="p-5 text-sm text-slate-300">No stocks matched the current filters.</article>
                    ) : null}
                  </section>
                )}

                <div className="pt-3 text-center">
                  <button
                    type="button"
                    onClick={() => loadNext(canLoadMore)}
                    disabled={!canLoadMore || isFetching}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-6 py-3 text-lg text-slate-100 hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Load Next 50 Rankings
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
