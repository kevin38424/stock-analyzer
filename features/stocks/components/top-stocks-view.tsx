import {
  Bell,
  Bookmark,
  ChevronDown,
  EllipsisVertical,
  Eye,
  LayoutDashboard,
  Lightbulb,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type FeaturedMetric = {
  label: string;
  value: number;
  accent: string;
};

type TopStockRow = {
  rank: number;
  ticker: string;
  company: string;
  industry: string;
  score: number;
  signal: "BUY" | "HOLD";
  price: string;
  change: string;
  positive: boolean;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "Top Stocks", icon: TrendingUp, active: true },
  { label: "Search", icon: Search, active: false },
  { label: "Watchlist", icon: Eye, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const featuredMetrics: FeaturedMetric[] = [
  { label: "FUNDAMENTALS", value: 78, accent: "bg-emerald-300" },
  { label: "MOMENTUM", value: 95, accent: "bg-emerald-400" },
  { label: "SENTIMENT", value: 84, accent: "bg-slate-300" },
  { label: "VALUE SCORE", value: 44, accent: "bg-amber-300" },
];

const topStockRows: TopStockRow[] = [
  {
    rank: 2,
    ticker: "MSFT",
    company: "Microsoft Corp.",
    industry: "Technology • Systems Software",
    score: 94,
    signal: "BUY",
    price: "$415.50",
    change: "+1.12%",
    positive: true,
  },
  {
    rank: 3,
    ticker: "ASML",
    company: "ASML Holding",
    industry: "Technology • Semiconductor Equipment",
    score: 91,
    signal: "BUY",
    price: "$942.10",
    change: "-0.45%",
    positive: false,
  },
  {
    rank: 4,
    ticker: "LLY",
    company: "Eli Lilly & Co.",
    industry: "Healthcare • Drug Manufacturers",
    score: 89,
    signal: "BUY",
    price: "$764.20",
    change: "+2.88%",
    positive: true,
  },
  {
    rank: 5,
    ticker: "V",
    company: "Visa Inc.",
    industry: "Finance • Credit Services",
    score: 86,
    signal: "HOLD",
    price: "$282.15",
    change: "+0.15%",
    positive: true,
  },
];

function ProgressBar({ value, accent }: { value: number; accent: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-[#3a4b75]">
      <div className={`h-1.5 rounded-full ${accent}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function RankingRow({ row }: { row: TopStockRow }) {
  return (
    <article className="grid items-center gap-4 rounded-xl border border-[#23355e] bg-[#111f43] px-4 py-4 sm:grid-cols-[56px_70px_1.3fr_1fr_0.8fr_28px_28px] sm:px-6">
      <p className="text-lg font-semibold text-slate-400">#{row.rank}</p>

      <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#0f1c3e] text-lg font-semibold text-slate-300">
        {row.ticker.slice(0, 1)}
      </div>

      <div>
        <p className="text-xl font-semibold leading-tight text-slate-100">{row.company}</p>
        <p className="text-sm text-slate-400">{row.industry}</p>
      </div>

      <div className="min-w-40">
        <p className="text-3xl font-semibold text-emerald-300">
          {row.score} <span className="text-sm tracking-wide text-emerald-300">{row.signal}</span>
        </p>
        <div className="mt-2">
          <ProgressBar value={row.score} accent={row.signal === "BUY" ? "bg-emerald-300" : "bg-slate-300"} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-semibold text-slate-100">{row.price}</p>
        <p className={`text-base ${row.positive ? "text-emerald-300" : "text-rose-300"}`}>{row.change}</p>
      </div>

      <button type="button" className="text-slate-400 transition hover:text-slate-200" aria-label="Bookmark stock">
        <Bookmark size={20} />
      </button>

      <button type="button" className="text-slate-400 transition hover:text-slate-200" aria-label="More actions">
        <EllipsisVertical size={20} />
      </button>
    </article>
  );
}

export function TopStocksView() {
  return (
    <main className="min-h-screen bg-[#050f2b] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-[#1f2e53] bg-[#020b24] px-3 py-7 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#1252ff]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-[38px] font-semibold tracking-tight">ScoreEngine</h2>
              <p className="text-[11px] tracking-[0.2em] text-slate-400">PREMIUM ANALYTICS</p>
            </div>
          </div>

          <nav className="mt-12 space-y-2">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={[
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-xl font-medium",
                  active
                    ? "border-[#235dff] bg-[#152445] text-slate-100"
                    : "border-transparent text-slate-400 hover:bg-[#0f1d3c] hover:text-slate-100",
                ].join(" ")}
              >
                <Icon size={22} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-[#182749] pt-4">
            <div className="flex items-center gap-3 rounded-lg p-3">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div>
                <p className="text-base font-semibold">Alex Rivera</p>
                <p className="text-xs text-slate-400">Pro Plan</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col">
          <header className="border-b border-[#1f2e53] bg-[#040d28] px-4 py-3 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-4xl">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  readOnly
                  value=""
                  placeholder="Search markets, tickers, or sectors..."
                  className="h-12 w-full rounded-md border border-[#19284a] bg-[#0d1a3a] pl-11 pr-4 text-base text-slate-300 outline-none"
                />
              </div>

              <div className="hidden items-center gap-4 text-slate-300 sm:flex">
                <Bell size={18} />
                <div className="h-6 w-6 rounded-full border border-slate-500" />
                <div className="h-7 w-px bg-[#22365f]" />
                <button type="button" className="flex items-center gap-2 text-sm">
                  Profile
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Top Stocks</h1>
                <p className="mt-3 max-w-4xl text-lg text-slate-300 sm:text-3xl">
                  Ranked by proprietary ScoreEngine analytics combining fundamentals, momentum, and institutional sentiment.
                </p>
              </div>

              <div className="mt-2 inline-flex rounded-md border border-[#22355f] bg-[#111f43] p-1 text-sm text-slate-300 sm:text-base">
                <button type="button" className="rounded-md bg-[#1a2d57] px-4 py-2 text-slate-100">
                  Card View
                </button>
                <button type="button" className="rounded-md px-4 py-2 hover:bg-[#1a2d57]">Table View</button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[340px_1fr]">
              <div className="space-y-5">
                <section className="rounded-xl border border-[#243761] bg-[#111f43] p-5">
                  <h2 className="text-xl font-semibold tracking-[0.08em] text-slate-200">FILTER PARAMETERS</h2>

                  <div className="mt-5 rounded-lg bg-[#15294f] p-3">
                    <div className="flex items-center justify-between text-base">
                      <span>Favorites Only</span>
                      <span className="relative inline-flex h-6 w-11 rounded-full bg-[#3a4b75]">
                        <span className="absolute right-[2px] top-[2px] h-5 w-5 rounded-full bg-slate-300" />
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <p>SCORE RANGE</p>
                      <p className="rounded bg-[#2a3c66] px-2 py-0.5">85 - 100</p>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-[#3a4b75]">
                      <div className="relative ml-[70%] h-1.5 w-[30%] rounded-full bg-[#38d9ff]">
                        <span className="absolute -left-1 -top-2 h-5 w-5 rounded-full bg-slate-200" />
                        <span className="absolute -right-1 -top-2 h-5 w-5 rounded-full bg-slate-200" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    <div>
                      <p className="text-sm text-slate-300">MARKET SECTOR</p>
                      <button
                        type="button"
                        className="mt-2 flex w-full items-center justify-between rounded-md bg-[#15294f] px-4 py-3 text-base"
                      >
                        All Sectors
                        <ChevronDown size={18} />
                      </button>
                    </div>

                    <div>
                      <p className="text-sm text-slate-300">VALUATION STYLE</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          { label: "Growth", active: true },
                          { label: "Value", active: false },
                          { label: "Income", active: false },
                        ].map((tab) => (
                          <button
                            type="button"
                            key={tab.label}
                            className={[
                              "rounded-md border px-4 py-2 text-sm",
                              tab.active
                                ? "border-[#4f6bad] bg-[#2a3c66] text-slate-100"
                                : "border-[#243761] bg-[#142750] text-slate-300",
                            ].join(" ")}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-8 w-full rounded-md bg-[#1b63ff] px-4 py-3 text-lg font-semibold text-slate-100"
                  >
                    Apply Analysis
                  </button>
                </section>

                <section className="rounded-xl border border-[#243761] bg-[#111f43] p-5">
                  <Lightbulb className="text-amber-300" size={20} />
                  <h3 className="mt-3 text-2xl font-semibold">Algorithm Note</h3>
                  <p className="mt-2 text-lg leading-relaxed text-slate-300">
                    Currently prioritizing <span className="text-emerald-300">momentum-heavy</span> assets due to
                    recent macro shifts in core inflation data.
                  </p>
                </section>
              </div>

              <div className="space-y-5">
                <section className="overflow-hidden rounded-xl border border-[#243761] bg-[#111f43]">
                  <div className="grid lg:grid-cols-[280px_1fr]">
                    <div className="flex flex-col items-center justify-center gap-2 border-b border-[#243761] bg-[#142750] p-8 lg:border-b-0 lg:border-r">
                      <p className="text-sm tracking-[0.35em] text-slate-400">RANK #1</p>
                      <p className="text-8xl font-semibold text-emerald-300">98</p>
                      <span className="rounded-full bg-emerald-500/15 px-4 py-1 text-sm font-semibold tracking-[0.2em] text-emerald-300">
                        STRONG BUY
                      </span>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-4xl font-semibold">Nvidia Corp.</h3>
                            <span className="rounded bg-[#2a3c66] px-2 py-1 text-base text-slate-300">NVDA</span>
                          </div>
                          <p className="mt-2 text-xl text-slate-300">Technology • Semiconductors</p>
                        </div>

                        <div className="text-right">
                          <p className="text-4xl font-semibold">$822.79</p>
                          <p className="mt-1 text-xl text-emerald-300">+4.25%</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-4">
                        {featuredMetrics.map((metric) => (
                          <div key={metric.label}>
                            <p className="text-sm text-slate-400">{metric.label}</p>
                            <div className="mt-2">
                              <ProgressBar value={metric.value} accent={metric.accent} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-md bg-[#0f1c3e] p-4 text-base leading-relaxed text-slate-200">
                        <span className="font-semibold">Why it ranks:</span> Exceptionally high free cash flow conversion
                        coupled with dominant market share in AI compute. Sentiment is near all-time highs with
                        institutional accumulation continuing through the current quarter.
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  {topStockRows.map((row) => (
                    <RankingRow key={row.rank} row={row} />
                  ))}
                </section>

                <div className="pt-3 text-center">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border border-[#2a3c66] bg-[#111f43] px-6 py-3 text-lg text-slate-100 hover:bg-[#162855]"
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
