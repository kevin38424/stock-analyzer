"use client";

import { useMemo, useState } from "react";
import { Bell, Gauge, Info, MessageSquare, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useHomeDashboard } from "@/features/home/hooks/useHomeDashboard";
import { useSearchResults } from "@/features/stocks/hooks/useSearchResults";
import type { HomeDashboardResponse } from "@/features/home/types/dashboard";
import { useCreateWatchlistItem } from "@/features/watchlist/hooks/useWatchlistMutations";
import type { WatchlistSegment } from "@/features/watchlist/types/watchlist";
import {
  appLayoutClasses,
  AppSidebar,
  AppTopbar,
  appTypographyClasses,
} from "@/features/shared";

type MetricCard = {
  label: string;
  value: string;
  subtext: string;
  accent: "blue" | "green" | "amber" | "violet" | "rose";
};

const demoUserId = "00000000-0000-4000-8000-000000000001";

const fallbackData: HomeDashboardResponse = {
  generatedAt: new Date(0).toISOString(),
  kpis: {
    stocksAnalyzed: 8492,
    stocksAnalyzedDelta: 12,
    strongBuys: 142,
    strongBuysPercent: 1.6,
    averageScore: 64.8,
    mostImprovedTicker: "NVDA",
    mostImprovedDeltaScore: 14,
    watchlistAlerts: 3,
  },
  topStocks: [
    {
      rank: 1,
      ticker: "AAPL",
      companyName: "Apple Inc.",
      sector: "Technology",
      score: 98,
      recommendation: "Strong Buy",
      price: 189.44,
      changePercent: 0.84,
    },
    {
      rank: 2,
      ticker: "MSFT",
      companyName: "Microsoft Corp.",
      sector: "Technology",
      score: 96,
      recommendation: "Strong Buy",
      price: 410.1,
      changePercent: 1.02,
    },
    {
      rank: 3,
      ticker: "NVDA",
      companyName: "NVIDIA Corp.",
      sector: "Technology",
      score: 94,
      recommendation: "Buy",
      price: 873.22,
      changePercent: 3.55,
    },
    {
      rank: 4,
      ticker: "AMZN",
      companyName: "Amazon.com Inc.",
      sector: "Consumer Discretionary",
      score: 91,
      recommendation: "Buy",
      price: 172.3,
      changePercent: 0.78,
    },
  ],
  watchlistPreview: [
    {
      ticker: "TSLA",
      companyName: "Tesla, Inc.",
      score: 82,
      signal: "Watch",
      price: 168.3,
      changePercent: -1.84,
    },
    {
      ticker: "META",
      companyName: "Meta Platforms",
      score: 89,
      signal: "Buy",
      price: 491.2,
      changePercent: 0.12,
    },
    {
      ticker: "GOOGL",
      companyName: "Alphabet Inc.",
      score: 93,
      signal: "Buy",
      price: 152.26,
      changePercent: 1.32,
    },
    {
      ticker: "BRK.B",
      companyName: "Berkshire Hath.",
      score: 76,
      signal: "Hold",
      price: 408.15,
      changePercent: 0,
    },
  ],
  sectorPerformance: [
    { sector: "Technology", changePercent: 2.4 },
    { sector: "Finance", changePercent: 0.8 },
    { sector: "Healthcare", changePercent: -1.2 },
  ],
  scoreDistribution: [
    { binStart: 0, binEnd: 9, count: 12 },
    { binStart: 10, binEnd: 19, count: 20 },
    { binStart: 20, binEnd: 29, count: 36 },
    { binStart: 30, binEnd: 39, count: 52 },
    { binStart: 40, binEnd: 49, count: 74 },
    { binStart: 50, binEnd: 59, count: 58 },
    { binStart: 60, binEnd: 69, count: 33 },
    { binStart: 70, binEnd: 79, count: 24 },
    { binStart: 80, binEnd: 89, count: 16 },
    { binStart: 90, binEnd: 99, count: 8 },
  ],
  insight: {
    title: "PRO INSIGHT",
    message: "NVDA score increased by 4 points due to institutional inflow. Bullish momentum building.",
  },
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const accentClassMap: Record<MetricCard["accent"], string> = {
  blue: "border-l-blue-500/80",
  green: "border-l-emerald-400/80",
  amber: "border-l-amber-400/80",
  violet: "border-l-violet-300/80",
  rose: "border-l-rose-300/80",
};

function formatSignedInteger(value: number): string {
  if (value === 0) return "0";
  const sign = value > 0 ? "+" : "-";
  return `${sign}${wholeNumberFormatter.format(Math.abs(value))}`;
}

export function HomeDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useHomeDashboard();
  const dashboard = data ?? fallbackData;
  const isInitialLoading = !data;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [isSectorInfoOpen, setIsSectorInfoOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [tickerQuery, setTickerQuery] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("");
  const [segment, setSegment] = useState<WatchlistSegment>("all_holdings");
  const [thesis, setThesis] = useState("");

  const { data: searchResultsData, isFetching: isSearchingTickers } = useSearchResults({
    q: tickerQuery,
    category: "stocks",
    includeTrending: false,
    limit: 8,
    enabled: isAddModalOpen && tickerQuery.trim().length > 1,
  });

  const {
    createWatchlistItemAsync,
    isPending: isAddingWatchlist,
    isError: isAddError,
    error: addError,
    reset: resetAddError,
  } = useCreateWatchlistItem(demoUserId);

  const metricCards: MetricCard[] = [
    {
      label: "Stocks analyzed",
      value: wholeNumberFormatter.format(dashboard.kpis.stocksAnalyzed),
      subtext: `${formatSignedInteger(dashboard.kpis.stocksAnalyzedDelta)} today`,
      accent: "blue",
    },
    {
      label: "Strong Buys",
      value: wholeNumberFormatter.format(dashboard.kpis.strongBuys),
      subtext: `Top ${dashboard.kpis.strongBuysPercent.toFixed(1)}% of market`,
      accent: "green",
    },
    {
      label: "Avg Score",
      value: dashboard.kpis.averageScore.toFixed(1),
      subtext: "",
      accent: "amber",
    },
    {
      label: "Most Improved",
      value: `$${dashboard.kpis.mostImprovedTicker}`,
      subtext: `${formatSignedInteger(dashboard.kpis.mostImprovedDeltaScore)} Score points`,
      accent: "violet",
    },
    {
      label: "Watchlist Alerts",
      value: String(dashboard.kpis.watchlistAlerts).padStart(2, "0"),
      subtext: "Volatility detected",
      accent: "rose",
    },
  ];

  const topRows = dashboard.topStocks;
  const watchlistRows = dashboard.watchlistPreview;
  const sectorRows = dashboard.sectorPerformance;

  const tickerSuggestions = useMemo(() => {
    return (searchResultsData?.results ?? []).slice(0, 8);
  }, [searchResultsData?.results]);

  async function handleAddToWatchlist() {
    if (!selectedTicker.trim()) return;

    try {
      await createWatchlistItemAsync({
        ticker: selectedTicker.trim().toUpperCase(),
        segment,
        thesis: thesis.trim() || undefined,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["watchlist-page"] }),
      ]);

      setTickerQuery("");
      setSelectedTicker("");
      setThesis("");
      setIsAddModalOpen(false);
    } catch {
      // handled by mutation state
    }
  }

  function openWatchlistModal() {
    resetAddError();
    setIsAddModalOpen(true);
  }

  return (
    <main className={`${appLayoutClasses.page} ${isFocusMode ? "[&_section]:shadow-none" : ""}`}>
      <div className={appLayoutClasses.shell}>
        <AppSidebar activePage="dashboard" />

        <section className="flex min-h-screen flex-col">
          <AppTopbar
            alertsCount={data ? dashboard.kpis.watchlistAlerts : 0}
            onAlertsClick={() => setIsAlertsOpen((prev) => !prev)}
            onThemeClick={() => setIsFocusMode((prev) => !prev)}
            onProfileClick={() => router.push("/settings")}
          />

          <div className={`relative ${appLayoutClasses.content}`}>
            {isAlertsOpen ? (
              <section className="absolute right-0 top-0 z-20 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl sm:right-6 lg:right-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-[0.15em] text-slate-300">ALERTS</h2>
                  <button
                    type="button"
                    onClick={() => setIsAlertsOpen(false)}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    aria-label="Close alerts"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  {watchlistRows.slice(0, 3).map((item) => (
                    <p key={item.ticker}>
                      {item.ticker}: {item.changePercent > 0 ? "+" : ""}
                      {item.changePercent.toFixed(2)}% move detected.
                    </p>
                  ))}
                  {watchlistRows.length === 0 ? <p>No active watchlist alerts.</p> : null}
                </div>
              </section>
            ) : null}

            <section className="relative overflow-hidden rounded-xl bg-[#0a1f4a] p-6 sm:p-8">
              <div className="max-w-2xl">
                <p className={appTypographyClasses.eyebrow}>MARKET INTELLIGENCE</p>
                <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  Discover Attractive <span className="text-emerald-300">Stocks</span>
                  <br />
                  With Quantitative Precision.
                </h1>
                <p className={appTypographyClasses.pageSubtitle}>
                  ScoreEngine leverages institutional-grade data models to rank global equities
                  based on growth, value, and momentum pillars.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/top-stocks"
                    className="rounded-md bg-gradient-to-r from-blue-600 to-slate-200 px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(59,130,246,0.35)]"
                  >
                    Explore Top 500
                  </Link>
                  <Link
                    href="/top-stocks?sector=all&valuationStyle=value"
                    className="rounded-md bg-slate-700/80 px-8 py-3 text-sm font-semibold text-slate-100"
                  >
                    View Sector Report
                  </Link>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-6 right-4 hidden text-slate-500/20 lg:block">
                <Gauge size={250} strokeWidth={1.5} />
              </div>
            </section>

            <section className="mt-6 grid gap-4 xl:grid-cols-5">
              {metricCards.map((item, index) => (
                <article
                  key={item.label}
                  className={[
                    "rounded-xl border border-l-2 border-slate-800 bg-slate-900/70 px-5 py-4",
                    accentClassMap[item.accent],
                  ].join(" ")}
                >
                  <p className="text-sm text-slate-400">{item.label}</p>
                  {isInitialLoading ? (
                    <>
                      <div className="app-skeleton mt-2 h-8 w-20" />
                      <div className="app-skeleton mt-3 h-4 w-24" />
                    </>
                  ) : (
                    <>
                      <p className="app-data mt-2 text-3xl font-semibold leading-none tracking-tight">{item.value}</p>
                      {index === 2 ? (
                        <div className="mt-4 h-1.5 rounded-full bg-slate-700">
                          <div className="h-1.5 w-2/3 rounded-full bg-cyan-300" />
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <p className="text-emerald-300">{item.subtext}</p>
                          {item.label === "Watchlist Alerts" ? <Bell size={14} className="text-rose-300" /> : null}
                        </div>
                      )}
                    </>
                  )}
                </article>
              ))}
            </section>

            <section className="mt-7 grid gap-6 xl:grid-cols-[2.1fr_1fr]">
              <div className="space-y-6">
                <article className="rounded-xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className={appTypographyClasses.sectionTitle}>Top Stocks to Buy</h2>
                    <Link href="/top-stocks" className="text-sm font-semibold text-slate-200">
                      View Full Ranking
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="text-sm text-slate-400">
                        <tr>
                          <th className="pb-4">Rank</th>
                          <th className="pb-4">Company</th>
                          <th className="pb-4">Score</th>
                          <th className="pb-4">Recommendation</th>
                          <th className="pb-4">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isInitialLoading
                          ? Array.from({ length: 4 }).map((_, index) => (
                              <tr key={`top-skeleton-${index}`} className="border-t border-slate-800">
                                <td className="py-4"><div className="app-skeleton h-6 w-10" /></td>
                                <td className="py-4"><div className="app-skeleton h-8 w-56 max-w-full" /></td>
                                <td className="py-4"><div className="app-skeleton h-7 w-24" /></td>
                                <td className="py-4"><div className="app-skeleton h-7 w-28 rounded-full" /></td>
                                <td className="py-4"><div className="app-skeleton h-8 w-24" /></td>
                              </tr>
                            ))
                          : topRows.map((row) => (
                              <tr key={row.ticker} className="border-t border-slate-800">
                                <td className="app-data py-4 text-xl font-semibold">#{row.rank}</td>
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <Link
                                      href={`/stocks/${encodeURIComponent(row.ticker)}`}
                                      className="rounded bg-slate-700 px-2 py-2 text-xs font-semibold"
                                    >
                                      {row.ticker}
                                    </Link>
                                    <Link href={`/stocks/${encodeURIComponent(row.ticker)}`}>
                                      <p className="text-lg font-semibold leading-tight">{row.companyName}</p>
                                      <p className="text-xs text-slate-400">{row.sector}</p>
                                    </Link>
                                  </div>
                                </td>
                                <td className="py-4">
                                  <div className="flex min-w-36 items-center gap-3">
                                    <span className="app-data text-2xl font-semibold">{row.score}</span>
                                    <div className="h-1.5 w-16 rounded-full bg-slate-700">
                                      <div
                                        className="h-1.5 rounded-full bg-emerald-300"
                                        style={{ width: `${Math.max(0, Math.min(100, row.score))}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4">
                                  <span className="rounded-sm bg-emerald-400/15 px-3 py-1 text-xs font-bold tracking-wider text-emerald-300">
                                    {row.recommendation.toUpperCase()}
                                  </span>
                                </td>
                                <td className="app-data py-4 text-2xl font-semibold">{currencyFormatter.format(row.price)}</td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <div className="grid gap-6 lg:grid-cols-2">
                  <article className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className={appTypographyClasses.sectionTitle}>Sector Performance</h3>
                      <button
                        type="button"
                        onClick={() => setIsSectorInfoOpen((prev) => !prev)}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        aria-label="Sector performance info"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                    {isSectorInfoOpen ? (
                      <p className="mb-3 rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
                        Sector performance reflects latest daily percentage move from the ranked market universe.
                      </p>
                    ) : null}
                    <div className="space-y-5">
                      {(isInitialLoading ? [] : sectorRows).map((row) => {
                        const width = `${Math.max(10, Math.min(100, Math.abs(row.changePercent) * 35))}%`;
                        const barClass = row.changePercent >= 0 ? "bg-emerald-300" : "bg-rose-300";
                        const textClass = row.changePercent >= 0 ? "text-emerald-300" : "text-rose-300";
                        const sign = row.changePercent > 0 ? "+" : "";
                        return (
                          <div key={row.sector}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span>{row.sector}</span>
                              <span className={textClass}>{`${sign}${row.changePercent.toFixed(1)}%`}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-700">
                              <div className={`h-2 rounded-full ${barClass}`} style={{ width }} />
                            </div>
                          </div>
                        );
                      })}
                      {isInitialLoading ? (
                        <>
                          <div className="app-skeleton h-8 w-full" />
                          <div className="app-skeleton h-8 w-full" />
                          <div className="app-skeleton h-8 w-full" />
                        </>
                      ) : null}
                    </div>
                  </article>

                  <article className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                    <h3 className={appTypographyClasses.sectionTitle}>Score Distribution</h3>
                    <div className="mt-6 flex h-40 items-end gap-2">
                      {(isInitialLoading ? [] : dashboard.scoreDistribution).map((bin) => {
                        const midpoint = (bin.binStart + bin.binEnd) / 2;
                        const isHighlighted = midpoint >= 40 && midpoint <= 60;
                        return (
                          <div
                            key={`${bin.binStart}-${bin.binEnd}`}
                            className={isHighlighted ? "w-9 bg-blue-500" : "w-9 bg-slate-700"}
                            style={{ height: `${Math.max(8, bin.count)}%` }}
                          />
                        );
                      })}
                      {isInitialLoading
                        ? Array.from({ length: 8 }).map((_, index) => (
                            <div key={`dist-skeleton-${index}`} className="app-skeleton w-9" style={{ height: `${30 + index * 6}%` }} />
                          ))
                        : null}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                      <span>0</span>
                      <span>Score</span>
                      <span>100</span>
                    </div>
                  </article>
                </div>
              </div>

              <aside className="relative rounded-xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Watchlist Preview</h2>
                  <button
                    type="button"
                    className="text-slate-300"
                    onClick={openWatchlistModal}
                    aria-label="Add stock to watchlist"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="mt-5 space-y-2.5">
                  {isInitialLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <div key={`watch-skeleton-${index}`} className="flex items-center justify-between rounded-md border border-slate-800 bg-[#152447] px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className="app-skeleton h-6 w-12 rounded" />
                            <div>
                              <div className="app-skeleton h-5 w-36" />
                              <div className="app-skeleton mt-2 h-4 w-24" />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="app-skeleton h-6 w-20" />
                            <div className="app-skeleton mt-2 h-4 w-14" />
                          </div>
                        </div>
                      ))
                    : watchlistRows.map((item) => (
                        <Link
                          href={`/stocks/${encodeURIComponent(item.ticker)}`}
                          key={item.ticker}
                          className="flex items-center justify-between rounded-md border border-slate-800 bg-[#152447] px-3 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded bg-slate-700 px-2 py-1 text-xs font-semibold">{item.ticker}</div>
                            <div>
                              <p className="text-base font-semibold">{item.companyName}</p>
                              <p className="text-xs text-slate-400">
                                {item.score} Score • {item.signal}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="app-data text-xl font-semibold">{currencyFormatter.format(item.price)}</p>
                            <p className={item.changePercent > 0 ? "text-xs text-emerald-300" : "text-xs text-rose-300"}>
                              {`${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`}
                            </p>
                          </div>
                        </Link>
                      ))}
                </div>

                <Link
                  href="/watchlist"
                  className="mt-5 block w-full rounded-md bg-slate-700/70 px-4 py-3 text-center text-sm font-semibold tracking-wide"
                >
                  VIEW FULL WATCHLIST
                </Link>

                <article className="mt-7 rounded-lg bg-[#10306e] px-4 py-4">
                  {isInitialLoading ? (
                    <>
                      <div className="app-skeleton h-4 w-28" />
                      <div className="app-skeleton mt-2 h-4 w-full" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">{dashboard.insight.title}</p>
                      <p className="mt-2 text-sm text-slate-200">{dashboard.insight.message}</p>
                    </>
                  )}
                </article>

                <button
                  type="button"
                  onClick={() => setIsInsightOpen(true)}
                  className="absolute bottom-[42%] right-[-18px] hidden h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-200 text-blue-950 lg:flex"
                  aria-label="Open insights panel"
                >
                  <MessageSquare size={18} />
                </button>
              </aside>
            </section>
          </div>
        </section>
      </div>

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-[#0b1f45] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Stock To Watchlist</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close add stock modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-[0.12em] text-slate-400">TICKER SEARCH</label>
                <input
                  value={tickerQuery}
                  onChange={(event) => {
                    setTickerQuery(event.target.value);
                    setSelectedTicker(event.target.value.trim().toUpperCase());
                  }}
                  placeholder="Type ticker (e.g. AAPL)"
                  className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-[#102650] px-3 text-sm outline-none"
                />
                {isSearchingTickers ? <p className="mt-2 text-xs text-slate-400">Searching...</p> : null}
                {tickerSuggestions.length > 0 ? (
                  <div className="mt-2 max-h-40 overflow-auto rounded-md border border-slate-700 bg-slate-900/70">
                    {tickerSuggestions.map((result) => (
                      <button
                        key={result.ticker}
                        type="button"
                        onClick={() => {
                          setSelectedTicker(result.ticker);
                          setTickerQuery(result.ticker);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-800/70"
                      >
                        <span>
                          {result.ticker} · {result.name}
                        </span>
                        <span className="text-xs text-slate-400">{result.sector}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-xs font-semibold tracking-[0.12em] text-slate-400">SEGMENT</label>
                <select
                  value={segment}
                  onChange={(event) => setSegment(event.target.value as WatchlistSegment)}
                  className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-[#102650] px-3 text-sm outline-none"
                >
                  <option value="all_holdings">All Holdings</option>
                  <option value="tech_growth">Tech Growth</option>
                  <option value="dividends">Dividends</option>
                  <option value="speculative">Speculative</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-[0.12em] text-slate-400">THESIS (OPTIONAL)</label>
                <textarea
                  value={thesis}
                  onChange={(event) => setThesis(event.target.value)}
                  rows={3}
                  placeholder="Why do you want to track this stock?"
                  className="mt-2 w-full rounded-md border border-slate-700 bg-[#102650] px-3 py-2 text-sm outline-none"
                />
              </div>

              {isAddError ? (
                <p className="rounded-md border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
                  {addError instanceof Error ? addError.message : "Failed to add watchlist item."}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-md border border-slate-600 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleAddToWatchlist()}
                  disabled={!selectedTicker.trim() || isAddingWatchlist}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isAddingWatchlist ? "Adding..." : "Add To Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isInsightOpen ? (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-slate-700 bg-[#071937] p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Insight Assistant</h2>
            <button
              type="button"
              onClick={() => setIsInsightOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Close insights panel"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-300">{dashboard.insight.message}</p>
          <div className="mt-5 space-y-2">
            {dashboard.topStocks.slice(0, 3).map((item) => (
              <button
                key={item.ticker}
                type="button"
                onClick={() => {
                  setIsInsightOpen(false);
                  router.push(`/stocks/${encodeURIComponent(item.ticker)}`);
                }}
                className="flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-left text-sm hover:bg-slate-800/70"
              >
                <span>{item.ticker} momentum details</span>
                <span className="text-slate-400">{item.score}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
