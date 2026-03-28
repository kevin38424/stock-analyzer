"use client";

import {
  AlertTriangle,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useStockDetails } from "@/features/stocks/hooks/useStockDetails";
import { useStockWatchlistActions } from "@/features/stocks/hooks/useStockWatchlistActions";
import { useStockWatchlistStatus } from "@/features/stocks/hooks/useStockWatchlistStatus";
import type { RangeOption } from "@/features/stocks/types/stock-details";
import { AppSidebar, AppTopbar, appLayoutClasses, appTypographyClasses } from "@/features/shared";

type StockProfile = {
  companyName: string;
  subtitle: string;
  price: string;
  priceChange: string;
};

type ScoreRow = {
  label: string;
  value: number;
  accent: "emerald" | "sky" | "amber";
};

type MetricColumn = {
  title: string;
  badge: string;
  badgeTone: "amber" | "emerald";
  rows: Array<{ label: string; value: string }>;
};

type PeerRow = {
  ticker: string;
  score: number;
  pe: string;
  marketCap: string;
  rating: "STRONG BUY" | "BUY" | "WATCH";
};

type NewsRow = {
  tag: string;
  age: string;
  title: string;
  summary: string;
  image: "phone" | "chart";
  url?: string;
};

type ToastMessage = {
  id: string;
  tone: "success" | "error" | "info";
  message: string;
};

const stockProfiles: Record<string, StockProfile> = {
  AAPL: {
    companyName: "Apple Inc.",
    subtitle: "NASDAQ • Consumer Electronics • Cupertino, CA",
    price: "$189.43",
    priceChange: "~ +2.45 (1.31%)",
  },
  MSFT: {
    companyName: "Microsoft Corporation",
    subtitle: "NASDAQ • Software • Redmond, WA",
    price: "$410.10",
    priceChange: "~ +4.14 (1.02%)",
  },
  GOOGL: {
    companyName: "Alphabet Inc.",
    subtitle: "NASDAQ • Internet Services • Mountain View, CA",
    price: "$152.26",
    priceChange: "~ +1.98 (1.32%)",
  },
  NVDA: {
    companyName: "NVIDIA Corporation",
    subtitle: "NASDAQ • Semiconductors • Santa Clara, CA",
    price: "$873.22",
    priceChange: "~ +29.96 (3.55%)",
  },
  AMZN: {
    companyName: "Amazon.com, Inc.",
    subtitle: "NASDAQ • Retail • Seattle, WA",
    price: "$172.30",
    priceChange: "~ +1.33 (0.78%)",
  },
  TSLA: {
    companyName: "Tesla, Inc.",
    subtitle: "NASDAQ • Automotive • Austin, TX",
    price: "$168.30",
    priceChange: "~ -3.16 (-1.84%)",
  },
  META: {
    companyName: "Meta Platforms, Inc.",
    subtitle: "NASDAQ • Internet Services • Menlo Park, CA",
    price: "$491.20",
    priceChange: "~ +0.59 (0.12%)",
  },
  "BRK.B": {
    companyName: "Berkshire Hathaway Inc.",
    subtitle: "NYSE • Conglomerate • Omaha, NE",
    price: "$408.15",
    priceChange: "~ +0.00 (0.00%)",
  },
  ASML: {
    companyName: "ASML Holding N.V.",
    subtitle: "NASDAQ • Semiconductor Equipment • Veldhoven, NL",
    price: "$942.10",
    priceChange: "~ -4.26 (-0.45%)",
  },
  LLY: {
    companyName: "Eli Lilly and Company",
    subtitle: "NYSE • Pharmaceuticals • Indianapolis, IN",
    price: "$764.20",
    priceChange: "~ +21.45 (2.88%)",
  },
  V: {
    companyName: "Visa Inc.",
    subtitle: "NYSE • Financial Services • Foster City, CA",
    price: "$282.15",
    priceChange: "~ +0.42 (0.15%)",
  },
};

const scoreRows: ScoreRow[] = [
  { label: "Valuation (30%)", value: 72, accent: "sky" },
  { label: "Profitability (20%)", value: 94, accent: "emerald" },
  { label: "Growth (20%)", value: 85, accent: "emerald" },
  { label: "Health (15%)", value: 91, accent: "sky" },
  { label: "Momentum (10%)", value: 64, accent: "amber" },
];

const attractivePoints = [
  "Dominant Ecosystem: High retention rates and growing services revenue (22% YoY) provide predictable cash flow.",
  "Cash Engine: $100B+ FCF allows for massive share buybacks and steady dividend growth.",
  "Operational Excellence: Industry-leading ROIC of 55%+ showcases superior capital allocation.",
];

const riskPoints = [
  "Geopolitical Exposure: Supply chain concentration in mainland China remains a structural vulnerability.",
  "Valuation Premium: Trading at 28x P/E, significantly above its 10-year median of 19x.",
  "Regulatory Headwinds: App Store practices in the EU and US could impact high-margin services.",
];

const metricColumns: MetricColumn[] = [
  {
    title: "VALUATION",
    badge: "Elevated",
    badgeTone: "amber",
    rows: [
      { label: "P/E Ratio (TTM)", value: "28.4x" },
      { label: "EV/EBITDA", value: "22.1x" },
      { label: "Price / Sales", value: "7.8x" },
    ],
  },
  {
    title: "PROFITABILITY",
    badge: "Elite",
    badgeTone: "emerald",
    rows: [
      { label: "Gross Margin", value: "44.1%" },
      { label: "Net Margin", value: "25.3%" },
      { label: "ROE", value: "160.1%" },
    ],
  },
  {
    title: "GROWTH (3Y)",
    badge: "Strong",
    badgeTone: "emerald",
    rows: [
      { label: "Revenue Growth", value: "+12.4%" },
      { label: "EPS Growth", value: "+18.7%" },
      { label: "FCF Growth", value: "+9.2%" },
    ],
  },
];

const peerRows: PeerRow[] = [
  { ticker: "AAPL", score: 88, pe: "28.4", marketCap: "$2.94T", rating: "STRONG BUY" },
  { ticker: "MSFT", score: 82, pe: "34.1", marketCap: "$3.05T", rating: "BUY" },
  { ticker: "GOOGL", score: 76, pe: "24.5", marketCap: "$1.82T", rating: "WATCH" },
];

const newsRows: NewsRow[] = [
  {
    tag: "MARKET NEWS",
    age: "2 hours ago",
    title: "Apple Vision Pro Demand Exceeds Initial Forecasts in Early Retail Trials",
    summary:
      "Early data suggests the premium spatial computing device is seeing higher than expected attachment rates for AppleCare+...",
    image: "phone",
  },
  {
    tag: "ANALYSIS",
    age: "5 hours ago",
    title: "ScoreEngine Alert: AAPL Dividend Yield Sustainability Check",
    summary:
      "Analyzing the latest free cash flow projections versus capital return commitments shows a healthy payout ratio of under 15%...",
    image: "chart",
  },
];

function LogoMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-500/60 bg-slate-900 text-[9px] font-bold text-slate-200">
      <div className="h-8 w-8 rounded-md border border-slate-600/80 bg-black/60" />
    </div>
  );
}

function PriceChart() {
  return (
    <div className="mt-5 rounded-lg border border-slate-800/70 bg-[#15203f] p-4">
      <svg viewBox="0 0 840 300" className="h-[260px] w-full" role="img" aria-label="Price trend chart">
        <defs>
          <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CF4CF" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#4CF4CF" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="840" height="300" fill="#15203f" rx="8" />

        <path
          d="M0 150 C80 130, 150 180, 210 155 C270 128, 310 72, 360 104 C410 135, 450 265, 520 172 C590 78, 650 28, 700 160 C750 270, 795 265, 840 150"
          fill="none"
          stroke="#54F5CF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 150 C80 130, 150 180, 210 155 C270 128, 310 72, 360 104 C410 135, 450 265, 520 172 C590 78, 650 28, 700 160 C750 270, 795 265, 840 150 L840 300 L0 300 Z"
          fill="url(#price-fill)"
        />

        <path
          d="M0 155 C120 140, 220 175, 300 155 C420 122, 500 210, 620 152 C710 112, 770 205, 840 180"
          fill="none"
          stroke="#8CA0C6"
          strokeOpacity="0.45"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function ScoreBar({ row }: { row: ScoreRow }) {
  const colorClass =
    row.accent === "emerald"
      ? "bg-emerald-300"
      : row.accent === "amber"
        ? "bg-amber-300"
        : "bg-sky-300";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-slate-200">{row.label}</span>
        <span className="font-semibold text-slate-100">{row.value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700/80">
        <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${row.value}%` }} />
      </div>
    </div>
  );
}

function Donut() {
  return (
    <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full border-[14px] border-emerald-300/90 border-r-slate-700/70 border-t-slate-700/70">
      <div className="text-center">
        <p className="text-[46px] font-semibold leading-none">Buy</p>
        <p className="mt-1 text-sm text-slate-400">42 Analysts</p>
      </div>
    </div>
  );
}

function NewsImage({ variant }: { variant: "phone" | "chart" }) {
  if (variant === "phone") {
    return (
      <div className="grid h-24 w-24 place-items-center rounded-md bg-gradient-to-br from-[#041830] via-[#0d3a6f] to-[#1d7ca8]">
        <div className="h-14 w-9 rounded-lg border border-slate-300/60 bg-slate-900/70" />
      </div>
    );
  }

  return (
    <div className="h-24 w-24 rounded-md bg-gradient-to-br from-[#091526] via-[#0f2e47] to-[#15635e]">
      <svg viewBox="0 0 100 100" className="h-full w-full opacity-90">
        <path d="M0 70 L20 62 L35 68 L54 44 L67 55 L83 35 L100 22" fill="none" stroke="#65F5CF" strokeWidth="2" />
        <path d="M0 82 L20 76 L35 79 L54 58 L67 66 L83 49 L100 41" fill="none" stroke="#88A6D9" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function StockDetailsPage({ ticker = "AAPL" }: { ticker?: string }) {
  const normalizedTicker = ticker.toUpperCase();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userId = process.env.NEXT_PUBLIC_SETTINGS_USER_ID ?? null;
  const initialRange = useMemo(() => {
    const value = searchParams.get("range");
    if (value === "1D" || value === "1W" || value === "1M" || value === "1Y" || value === "ALL") {
      return value;
    }
    return "1M";
  }, [searchParams]);
  const [range, setRange] = useState<RangeOption>(initialRange);
  const { data } = useStockDetails({
    ticker: normalizedTicker,
    range,
    enabled: Boolean(normalizedTicker),
  });
  const { data: watchlistStatus, refetch: refetchWatchlistStatus } = useStockWatchlistStatus({
    ticker: normalizedTicker,
    userId,
    enabled: Boolean(normalizedTicker),
  });
  const { addToWatchlist, removeFromWatchlist, isAdding, isRemoving } = useStockWatchlistActions();
  const isWatchlistPending = isAdding || isRemoving;
  const isInWatchlist = watchlistStatus?.isInWatchlist ?? false;
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  });

  const shortDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  function formatRelativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const diffMs = Date.now() - date.getTime();
    if (!Number.isFinite(diffMs) || diffMs < 0) return "just now";
    const hours = Math.floor(diffMs / 3_600_000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const apiScoreRows = data?.scoreBreakdown?.map((row) => ({
    label: `${row.label} (${row.weightPct}%)`,
    value: row.score,
    accent: row.key === "momentum" ? "amber" : row.key === "valuation" || row.key === "health" ? "sky" : "emerald",
  })) as ScoreRow[] | undefined;

  const apiMetricColumns = data?.financialMetrics as MetricColumn[] | undefined;
  const apiPeerRows = data?.peerComparison?.map((row) => ({
    ticker: row.ticker,
    score: row.score,
    pe: row.pe.toFixed(1),
    marketCap: `$${row.marketCapUsdTrillion.toFixed(2)}T`,
    rating: row.rating === "AVOID" ? "WATCH" : row.rating,
  })) as PeerRow[] | undefined;

  const apiNewsRows = data?.news?.map((item) => ({
    tag: item.kind,
    age: formatRelativeTime(item.publishedAt),
    title: item.title,
    summary: item.summary,
    image: item.kind === "ANALYSIS" ? "chart" : "phone",
    url: item.url,
  })) as NewsRow[] | undefined;

  const scoreRowsData = apiScoreRows?.length ? apiScoreRows : scoreRows;
  const attractivePointsData = data?.highlights?.attractive?.length ? data.highlights.attractive : attractivePoints;
  const riskPointsData = data?.highlights?.risks?.length ? data.highlights.risks : riskPoints;
  const metricColumnsData = apiMetricColumns?.length ? apiMetricColumns : metricColumns;
  const peerRowsData = apiPeerRows?.length ? apiPeerRows : peerRows;
  const newsRowsData = apiNewsRows?.length ? apiNewsRows : newsRows;

  const stockProfile = stockProfiles[normalizedTicker] ?? {
    companyName: `${normalizedTicker} Corp.`,
    subtitle: `NASDAQ • Equity • ${normalizedTicker}`,
    price: "$0.00",
    priceChange: "~ +0.00 (0.00%)",
  };

  const profile = data
    ? {
        companyName: data.companyName,
        subtitle: `${data.exchange} • ${data.sector} • ${data.headquarters}`,
        price: priceFormatter.format(data.priceSummary.lastPrice),
        priceChange: `${data.priceSummary.change >= 0 ? "+" : ""}${data.priceSummary.change.toFixed(2)} (${data.priceSummary.changePercent >= 0 ? "+" : ""}${data.priceSummary.changePercent.toFixed(2)}%)`,
      }
    : stockProfile;

  const asOfLabel = data
    ? `At close: ${shortDateTimeFormatter.format(new Date(data.priceSummary.asOf))}`
    : "At close: Jan 24, 4:00 PM EST";

  const chartDateLabels = data?.pricePerformance.points?.length
    ? [
        data.pricePerformance.points[0],
        data.pricePerformance.points[Math.floor((data.pricePerformance.points.length - 1) / 4)],
        data.pricePerformance.points[Math.floor((data.pricePerformance.points.length - 1) / 2)],
        data.pricePerformance.points[Math.floor(((data.pricePerformance.points.length - 1) * 3) / 4)],
        data.pricePerformance.points[data.pricePerformance.points.length - 1],
      ].map((point) => shortDateFormatter.format(new Date(point.date)))
    : ["Dec 24", "Jan 01", "Jan 08", "Jan 15", "Jan 22"];

  async function onTogglePortfolio() {
    if (!userId) {
      pushToast("Set a user id in Settings to enable portfolio persistence.", "info");
      router.push("/settings");
      return;
    }

    try {
      if (isInWatchlist) {
        await removeFromWatchlist({
          userId,
          ticker: normalizedTicker,
        });
        pushToast(`${normalizedTicker} removed from portfolio.`, "success");
      } else {
        await addToWatchlist({
          userId,
          ticker: normalizedTicker,
          segment: "all_holdings",
          thesis: attractivePointsData[0],
        });
        pushToast(`${normalizedTicker} added to portfolio.`, "success");
      }

      await refetchWatchlistStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update portfolio action.";
      pushToast(message, "error");
    }
  }

  function onSelectRange(nextRange: RangeOption) {
    setRange(nextRange);
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", nextRange);
    router.replace(`${pathname}?${params.toString()}` as Route);
  }

  function pushToast(message: string, tone: ToastMessage["tone"]) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, tone, message }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }

  return (
    <main className={appLayoutClasses.page}>
      <div className={appLayoutClasses.shell}>
        <AppSidebar activePage="top-stocks" />

        <section className="flex min-h-screen flex-col">
          <AppTopbar />

          <div className={`mx-auto w-full max-w-[1260px] space-y-6 ${appLayoutClasses.content}`}>
            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex items-start gap-3">
                  <LogoMark />
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {profile.companyName} <span className="text-slate-400">{normalizedTicker}</span>
                    </h1>
                    <p className={appTypographyClasses.pageSubtitle}>{profile.subtitle}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="app-data text-5xl font-semibold leading-none tracking-tight sm:text-6xl">{profile.price}</span>
                  <span
                    className={[
                      "app-data text-2xl font-semibold",
                      data?.priceSummary.changePercent != null && data.priceSummary.changePercent < 0
                        ? "text-rose-300"
                        : "text-emerald-300",
                    ].join(" ")}
                  >
                    {profile.priceChange}
                  </span>
                  <span className="text-sm text-slate-400 sm:text-base">{asOfLabel}</span>
                </div>
              </div>

              <article className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-[inset_3px_0_0_0_rgba(74,222,128,0.85)]">
                <p className="text-lg uppercase tracking-[0.2em] text-slate-400">ScoreEngine Rating</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                    {data?.rating.label ?? "Strong Buy"}
                  </span>
                  <p className="app-data text-6xl font-semibold leading-none">
                    {data?.rating.score ?? 88}<span className="text-2xl text-slate-400">/100</span>
                  </p>
                </div>
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className={appTypographyClasses.sectionTitle}>Price Performance</h2>
                  <div className="flex gap-1 rounded-md bg-slate-950/30 p-1 text-sm">
                    {["1D", "1W", "1M", "1Y", "ALL"].map((tab) => (
                      <button
                        type="button"
                        key={tab}
                        onClick={() => onSelectRange(tab as RangeOption)}
                        className={[
                          "rounded px-3 py-1 font-medium",
                          tab === range
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200",
                        ].join(" ")}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-300" />
                    Price ({normalizedTicker})
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-500" />
                    200 D MA
                  </span>
                </div>

                <PriceChart />
                <div className="mt-4 flex justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                  {chartDateLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </article>

              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <h2 className="text-4xl font-semibold">Score Breakdown</h2>
                <div className="mt-5 space-y-4">
                  {scoreRowsData.map((row) => (
                    <ScoreBar key={row.label} row={row} />
                  ))}
                </div>
                <p className="mt-8 text-sm italic text-slate-400">
                  &ldquo;Exceptional profitability and strong liquidity offset premium valuation multiples.&rdquo;
                </p>
              </article>
            </section>

            <section className="relative grid gap-4 lg:grid-cols-2">
              <article className="rounded-xl border border-emerald-500/55 bg-slate-900/65 p-5">
                <h3 className="flex items-center gap-2 text-3xl font-semibold">
                  <ShieldCheck size={20} className="text-emerald-300" />
                  Why Attractive
                </h3>
                <ul className="mt-5 space-y-4 text-lg leading-relaxed text-slate-200">
                  {attractivePointsData.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-emerald-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-xl border border-rose-400/40 bg-slate-900/65 p-5">
                <h3 className="flex items-center gap-2 text-3xl font-semibold">
                  <AlertTriangle size={20} className="text-rose-300" />
                  Risks &amp; Red Flags
                </h3>
                <ul className="mt-5 space-y-4 text-lg leading-relaxed text-slate-200">
                  {riskPointsData.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-rose-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <button
                type="button"
                onClick={() => void onTogglePortfolio()}
                disabled={isWatchlistPending}
                className="absolute bottom-2 right-2 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(37,99,235,0.45)]"
              >
                <Plus size={16} />
                {isWatchlistPending ? "Saving..." : isInWatchlist ? "In Portfolio" : "Add to Portfolio"}
              </button>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-5xl font-semibold">Financial Metrics</h2>
                <button
                  type="button"
                  onClick={() => router.push(`/stocks/${encodeURIComponent(normalizedTicker)}/financials`)}
                  className="text-lg font-medium text-slate-300 hover:text-slate-100"
                >
                  Full Financial Statements →
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {metricColumnsData.map((column) => (
                  <article key={column.title} className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xl tracking-[0.16em] text-slate-400">{column.title}</p>
                      <span
                        className={[
                          "rounded px-2 py-0.5 text-xs font-semibold",
                          column.badgeTone === "amber"
                            ? "bg-amber-300/20 text-amber-200"
                            : "bg-emerald-300/20 text-emerald-200",
                        ].join(" ")}
                      >
                        {column.badge}
                      </span>
                    </div>
                    <div className="space-y-3 text-lg">
                      {column.rows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between">
                          <span className="text-slate-300">{row.label}</span>
                          <span className="font-semibold text-slate-100">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <h3 className="text-4xl font-semibold">Peer Comparison</h3>
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="text-lg uppercase tracking-[0.15em] text-slate-400">
                      <tr>
                        <th className="pb-4 font-medium">Company</th>
                        <th className="pb-4 font-medium">Score</th>
                        <th className="pb-4 font-medium">P/E</th>
                        <th className="pb-4 font-medium">Market Cap</th>
                        <th className="pb-4 font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="text-2xl">
                      {peerRowsData.map((row) => (
                        <tr key={row.ticker} className="border-t border-slate-800/70">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="grid h-6 w-6 place-items-center rounded-sm border border-slate-600 text-xs">•</span>
                              <Link href={`/stocks/${encodeURIComponent(row.ticker)}`} className="font-semibold hover:text-cyan-200">
                                {row.ticker}
                              </Link>
                            </div>
                          </td>
                          <td className="py-4">{row.score}</td>
                          <td className="py-4">{row.pe}</td>
                          <td className="py-4">{row.marketCap}</td>
                          <td
                            className={[
                              "py-4 text-sm font-semibold",
                              row.rating === "WATCH"
                                ? "text-sky-300"
                                : row.rating === "BUY"
                                  ? "text-emerald-300"
                                  : "text-emerald-200",
                            ].join(" ")}
                          >
                            {row.rating}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <h3 className="text-4xl font-semibold">Analyst Consensus</h3>
                <div className="mt-4">
                  <Donut />
                </div>
                <div className="mt-6 space-y-3 text-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">High Target</span>
                    <span className="font-semibold text-emerald-300">
                      {priceFormatter.format(data?.analystConsensus.targetHigh ?? 240)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Median Target</span>
                    <span className="font-semibold text-slate-100">
                      {priceFormatter.format(data?.analystConsensus.targetMedian ?? 210.5)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Low Target</span>
                    <span className="font-semibold text-rose-300">
                      {priceFormatter.format(data?.analystConsensus.targetLow ?? 175)}
                    </span>
                  </div>
                </div>
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <h3 className="text-4xl font-semibold">Latest Insights &amp; News</h3>
                <div className="mt-5 space-y-5">
                  {newsRowsData.map((news) => (
                    <div key={news.title} className="flex gap-4">
                      <NewsImage variant={news.image} />
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {news.tag} <span className="normal-case tracking-normal text-slate-500">• {news.age}</span>
                        </p>
                        {news.url ? (
                          <a href={news.url} target="_blank" rel="noreferrer" className="mt-1 block text-3xl font-semibold leading-tight hover:text-cyan-200">
                            {news.title}
                          </a>
                        ) : (
                          <h4 className="mt-1 text-3xl font-semibold leading-tight">{news.title}</h4>
                        )}
                        <p className="mt-2 text-lg leading-relaxed text-slate-300">{news.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <h3 className="text-4xl font-semibold">Insider Activity</h3>

                <div className="mt-5 space-y-4 text-sm">
                  {(data?.insiderActivity.transactions ?? []).slice(0, 2).map((transaction) => (
                    <div
                      key={transaction.id}
                      className={[
                        "rounded-lg bg-[#101c3a] p-3",
                        transaction.tone === "sell"
                          ? "border border-slate-700/80"
                          : "border border-emerald-400/50",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-lg font-semibold">{transaction.name}</p>
                          <p className="text-xs text-slate-400">{transaction.role}</p>
                        </div>
                        <span className="text-xs text-slate-300">
                          {shortDateFormatter.format(new Date(transaction.date)).toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span
                          className={[
                            "rounded px-2 py-1 text-xs",
                            transaction.tone === "sell"
                              ? "bg-slate-700 text-slate-200"
                              : "bg-emerald-500/20 text-emerald-300",
                          ].join(" ")}
                        >
                          {transaction.actionLabel}
                        </span>
                        <span className="text-lg font-semibold">{transaction.valueLabel}</span>
                      </div>
                    </div>
                  ))}
                  {!data?.insiderActivity.transactions?.length ? (
                    <p className="text-sm text-slate-400">No recent insider transactions available.</p>
                  ) : null}
                </div>

                <div className="mt-5 text-sm text-slate-400">
                  <div className="mb-1 flex items-center justify-between">
                    <span>3M Activity</span>
                    <span className="text-slate-200">
                      Net {((data?.insiderActivity.net3mSellUsd ?? 4_800_000) >= 0) ? "Sell" : "Buy"}:{" "}
                      {priceFormatter.format(Math.abs((data?.insiderActivity.net3mSellUsd ?? 4_800_000) / 1_000_000))}M
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700/80">
                    <div className="h-2 w-[70%] rounded-full bg-rose-300" />
                  </div>
                </div>
              </article>
            </section>

          </div>
        </section>
      </div>

      <div className="pointer-events-none fixed right-5 top-5 z-50 space-y-2" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "rounded-md border px-3 py-2 text-sm shadow-lg",
              toast.tone === "success"
                ? "border-emerald-400/60 bg-emerald-950/85 text-emerald-100"
                : toast.tone === "error"
                  ? "border-rose-400/60 bg-rose-950/85 text-rose-100"
                  : "border-sky-400/60 bg-sky-950/85 text-sky-100",
            ].join(" ")}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </main>
  );
}
