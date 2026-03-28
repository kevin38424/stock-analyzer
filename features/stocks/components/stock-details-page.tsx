import {
  AlertTriangle,
  Bell,
  ChartNoAxesColumnIncreasing,
  Circle,
  Eye,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { ComponentType } from "react";

type SidebarItem = {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  active?: boolean;
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
};

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Top Stocks", icon: ChartNoAxesColumnIncreasing, active: true },
  { label: "Search", icon: Search },
  { label: "Watchlist", icon: Eye },
  { label: "Settings", icon: Settings },
];

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

      <div className="mt-4 flex justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
        <span>Dec 24</span>
        <span>Jan 01</span>
        <span>Jan 08</span>
        <span>Jan 15</span>
        <span>Jan 22</span>
      </div>
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

export function StockDetailsPage() {
  return (
    <main className="min-h-screen bg-[#030f2c] text-slate-100">
      <div className="grid min-h-screen xl:grid-cols-[255px_1fr]">
        <aside className="hidden border-r border-slate-800/70 bg-[#010a22] p-4 xl:flex xl:flex-col">
          <div className="px-3 pt-4">
            <h2 className="text-[38px] font-semibold leading-none tracking-tight">ScoreEngine</h2>
            <p className="mt-1 text-xs tracking-[0.22em] text-slate-400">PREMIUM ANALYTICS</p>
          </div>

          <nav className="mt-8 space-y-2 px-2">
            {sidebarItems.map(({ label, icon: Icon, active }) => (
              <button
                type="button"
                key={label}
                className={[
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-lg",
                  active
                    ? "border-blue-500 bg-slate-800/80 text-slate-100"
                    : "border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200",
                ].join(" ")}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#f3d1b4] to-[#8d6f58]" />
            <div>
              <p className="text-sm font-semibold">Alex Rivera</p>
              <p className="text-xs text-slate-400">Pro Member</p>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800/70 bg-[#05132f] px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-2xl">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  readOnly
                  value=""
                  placeholder="Search Tickers (e.g. AAPL, NVDA)..."
                  className="h-10 w-full rounded-md border border-slate-800/80 bg-[#0b1a3b] pl-9 pr-3 text-sm text-slate-300 outline-none"
                />
              </div>

              <button type="button" className="grid h-8 w-8 place-items-center rounded text-slate-300 hover:bg-slate-800/60">
                <Bell size={16} />
              </button>
              <button type="button" className="grid h-8 w-8 place-items-center rounded text-slate-300 hover:bg-slate-800/60">
                <Circle size={15} />
              </button>
              <button
                type="button"
                className="h-8 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.45)]"
              >
                Upgrade
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1260px] space-y-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex items-start gap-3">
                  <LogoMark />
                  <div>
                    <h1 className="text-5xl font-semibold tracking-tight text-white">
                      Apple Inc. <span className="text-slate-400">AAPL</span>
                    </h1>
                    <p className="mt-1 text-2xl text-slate-300">NASDAQ • Consumer Electronics • Cupertino, CA</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="text-7xl font-semibold leading-none tracking-tight">$189.43</span>
                  <span className="text-3xl font-semibold text-emerald-300">~ +2.45 (1.31%)</span>
                  <span className="text-lg text-slate-400">At close: Jan 24, 4:00 PM EST</span>
                </div>
              </div>

              <article className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-[inset_3px_0_0_0_rgba(74,222,128,0.85)]">
                <p className="text-lg uppercase tracking-[0.2em] text-slate-400">ScoreEngine Rating</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm font-semibold text-emerald-300">Strong Buy</span>
                  <p className="text-6xl font-semibold leading-none">
                    88<span className="text-2xl text-slate-400">/100</span>
                  </p>
                </div>
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-4xl font-semibold">Price Performance</h2>
                  <div className="flex gap-1 rounded-md bg-slate-950/30 p-1 text-sm">
                    {["1D", "1W", "1M", "1Y", "ALL"].map((tab) => (
                      <button
                        type="button"
                        key={tab}
                        className={[
                          "rounded px-3 py-1 font-medium",
                          tab === "1M"
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
                    Price (AAPL)
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-500" />
                    200 D MA
                  </span>
                </div>

                <PriceChart />
              </article>

              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <h2 className="text-4xl font-semibold">Score Breakdown</h2>
                <div className="mt-5 space-y-4">
                  {scoreRows.map((row) => (
                    <ScoreBar key={row.label} row={row} />
                  ))}
                </div>
                <p className="mt-8 text-sm italic text-slate-400">
                  "Exceptional profitability and strong liquidity offset premium valuation multiples."
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
                  {attractivePoints.map((point) => (
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
                  {riskPoints.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-rose-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <button
                type="button"
                className="absolute bottom-2 right-2 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(37,99,235,0.45)]"
              >
                <Plus size={16} />
                Add to Portfolio
              </button>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-5xl font-semibold">Financial Metrics</h2>
                <button type="button" className="text-lg font-medium text-slate-300 hover:text-slate-100">
                  Full Financial Statements →
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {metricColumns.map((column) => (
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
                      {peerRows.map((row) => (
                        <tr key={row.ticker} className="border-t border-slate-800/70">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="grid h-6 w-6 place-items-center rounded-sm border border-slate-600 text-xs">•</span>
                              <span className="font-semibold">{row.ticker}</span>
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
                    <span className="font-semibold text-emerald-300">$240.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Median Target</span>
                    <span className="font-semibold text-slate-100">$210.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Low Target</span>
                    <span className="font-semibold text-rose-300">$175.00</span>
                  </div>
                </div>
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <h3 className="text-4xl font-semibold">Latest Insights &amp; News</h3>
                <div className="mt-5 space-y-5">
                  {newsRows.map((news) => (
                    <div key={news.title} className="flex gap-4">
                      <NewsImage variant={news.image} />
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {news.tag} <span className="normal-case tracking-normal text-slate-500">• {news.age}</span>
                        </p>
                        <h4 className="mt-1 text-3xl font-semibold leading-tight">{news.title}</h4>
                        <p className="mt-2 text-lg leading-relaxed text-slate-300">{news.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-xl border border-slate-800/80 bg-slate-900/65 p-5">
                <h3 className="text-4xl font-semibold">Insider Activity</h3>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="rounded-lg border border-slate-700/80 bg-[#101c3a] p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold">Tim Cook</p>
                        <p className="text-xs text-slate-400">CEO</p>
                      </div>
                      <span className="text-xs text-slate-300">JAN 12</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200">Sold (Planned)</span>
                      <span className="text-lg font-semibold">$2.1M</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-400/50 bg-[#101c3a] p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold">Luca Maestri</p>
                        <p className="text-xs text-slate-400">CFO</p>
                      </div>
                      <span className="text-xs text-slate-300">DEC 28</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">Exercised Options</span>
                      <span className="text-lg font-semibold">45k Shares</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-sm text-slate-400">
                  <div className="mb-1 flex items-center justify-between">
                    <span>3M Activity</span>
                    <span className="text-slate-200">Net Sell: $4.8M</span>
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
    </main>
  );
}
