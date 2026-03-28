import {
  Bell,
  ChartNoAxesColumnIncreasing,
  Eye,
  Gauge,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Plus,
  Search,
  Settings,
} from "lucide-react";

type MetricCard = {
  label: string;
  value: string;
  subtext: string;
  accent: "blue" | "green" | "amber" | "violet" | "rose";
};

type RankingRow = {
  rank: string;
  ticker: string;
  company: string;
  subtitle: string;
  score: number;
  rec: "STRONG BUY" | "BUY";
  price: string;
};

type WatchlistRow = {
  ticker: string;
  name: string;
  score: number;
  signal: string;
  price: string;
  change: string;
  positive: boolean;
};

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Top Stocks", icon: ChartNoAxesColumnIncreasing, active: false },
  { label: "Search", icon: Search, active: false },
  { label: "Watchlist", icon: Eye, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const metricCards: MetricCard[] = [
  { label: "Stocks analyzed", value: "8,492", subtext: "+12 today", accent: "blue" },
  { label: "Strong Buys", value: "142", subtext: "Top 1.6% of market", accent: "green" },
  { label: "Avg Score", value: "64.8", subtext: "", accent: "amber" },
  { label: "Most Improved", value: "$NVDA", subtext: "+14 Score points", accent: "violet" },
  { label: "Watchlist Alerts", value: "03", subtext: "Volatility detected", accent: "rose" },
];

const rankingRows: RankingRow[] = [
  {
    rank: "#1",
    ticker: "AAPL",
    company: "Apple Inc.",
    subtitle: "Technology • Consumer Electronics",
    score: 98,
    rec: "STRONG BUY",
    price: "$189.44",
  },
  {
    rank: "#2",
    ticker: "MSFT",
    company: "Microsoft Corp.",
    subtitle: "Technology • Software",
    score: 96,
    rec: "STRONG BUY",
    price: "$410.10",
  },
  {
    rank: "#3",
    ticker: "NVDA",
    company: "NVIDIA Corp.",
    subtitle: "Technology • Semiconductors",
    score: 94,
    rec: "BUY",
    price: "$873.22",
  },
  {
    rank: "#4",
    ticker: "AMZN",
    company: "Amazon.com Inc.",
    subtitle: "Consumer Discretionary • Retail",
    score: 91,
    rec: "BUY",
    price: "$172.30",
  },
];

const watchlistRows: WatchlistRow[] = [
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    score: 82,
    signal: "Neutral",
    price: "$168.30",
    change: "-1.84%",
    positive: false,
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    score: 89,
    signal: "Buy",
    price: "$491.20",
    change: "+0.12%",
    positive: true,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    score: 93,
    signal: "Buy",
    price: "$152.26",
    change: "+1.32%",
    positive: true,
  },
  {
    ticker: "BRK.B",
    name: "Berkshire Hath.",
    score: 76,
    signal: "Hold",
    price: "$408.15",
    change: "0.00%",
    positive: false,
  },
];

const accentClassMap: Record<MetricCard["accent"], string> = {
  blue: "border-l-blue-500/80",
  green: "border-l-emerald-400/80",
  amber: "border-l-amber-400/80",
  violet: "border-l-violet-300/80",
  rose: "border-l-rose-300/80",
};

export function HomeDashboard() {
  return (
    <main className="min-h-screen bg-[#050f2b] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="hidden border-r border-slate-800/70 bg-[#030c24] px-7 pb-6 pt-8 lg:flex lg:flex-col">
          <div>
            <h2 className="text-[38px] font-semibold leading-none tracking-tight">ScoreEngine</h2>
            <p className="mt-2 text-xs tracking-[0.22em] text-slate-400">PREMIUM ANALYTICS</p>
          </div>

          <nav className="mt-10 space-y-2">
            {sidebarItems.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={[
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[22px] font-medium",
                  active
                    ? "border-blue-500/90 bg-slate-800/80 text-slate-100"
                    : "border-transparent text-slate-400 hover:bg-slate-900/70 hover:text-slate-200",
                ].join(" ")}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-700" />
              <div>
                <p className="text-sm font-semibold">Alex Mercer</p>
                <p className="text-xs text-slate-400">PRO MEMBER</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800/70 bg-[#030c24] px-6 py-4 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-full max-w-xl">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  readOnly
                  value=""
                  placeholder="Search tickers, sectors or analysts..."
                  className="h-11 w-full rounded-md border border-slate-800 bg-[#081534] pl-11 pr-4 text-sm text-slate-300 outline-none"
                />
              </div>

              <div className="flex items-center gap-4 text-slate-300">
                <Bell size={19} />
                <Moon size={18} />
                <div className="h-6 w-px bg-slate-700" />
                <span className="text-sm">Profile</span>
              </div>
            </div>
          </header>

          <div className="px-6 pb-12 pt-8 lg:px-10">
            <section className="relative overflow-hidden rounded-none bg-[#0a1f4a] p-7 sm:p-8 lg:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.38em] text-slate-300">MARKET INTELLIGENCE</p>
                <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                  Discover Attractive <span className="text-emerald-300">Stocks</span>
                  <br />
                  With Quantitative Precision.
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">
                  ScoreEngine leverages institutional-grade data models to rank global equities
                  based on growth, value, and momentum pillars.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    className="rounded-md bg-gradient-to-r from-blue-600 to-slate-200 px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_36px_rgba(59,130,246,0.35)]"
                  >
                    Explore Top 500
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-slate-700/80 px-8 py-3 text-sm font-semibold text-slate-100"
                  >
                    View Sector Report
                  </button>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-6 right-4 hidden text-slate-500/20 lg:block">
                <Gauge size={250} strokeWidth={1.5} />
              </div>
            </section>

            <section className="mt-7 grid gap-4 xl:grid-cols-5">
              {metricCards.map((item, index) => (
                <article
                  key={item.label}
                  className={[
                    "rounded-xl border border-l-2 border-slate-800 bg-slate-900/70 px-5 py-4",
                    accentClassMap[item.accent],
                  ].join(" ")}
                >
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-4xl font-semibold leading-none tracking-tight">{item.value}</p>
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
                </article>
              ))}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[2.1fr_1fr]">
              <div className="space-y-6">
                <article className="rounded-xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[30px] font-semibold">Top Stocks to Buy</h2>
                    <button type="button" className="text-sm font-semibold text-slate-200">
                      View Full Ranking
                    </button>
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
                        {rankingRows.map((row) => (
                          <tr key={row.rank} className="border-t border-slate-800">
                            <td className="py-4 text-2xl font-semibold">{row.rank}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="rounded bg-slate-700 px-2 py-2 text-xs font-semibold">
                                  {row.ticker}
                                </div>
                                <div>
                                  <p className="text-xl font-semibold leading-tight">{row.company}</p>
                                  <p className="text-xs text-slate-400">{row.subtitle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex min-w-36 items-center gap-3">
                                <span className="text-3xl font-semibold">{row.score}</span>
                                <div className="h-1.5 w-16 rounded-full bg-slate-700">
                                  <div
                                    className="h-1.5 rounded-full bg-emerald-300"
                                    style={{ width: `${row.score}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="rounded-sm bg-emerald-400/15 px-3 py-1 text-xs font-bold tracking-wider text-emerald-300">
                                {row.rec}
                              </span>
                            </td>
                            <td className="py-4 text-3xl font-semibold">{row.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <div className="grid gap-6 lg:grid-cols-2">
                  <article className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-[30px] font-semibold">Sector Performance</h3>
                      <span className="text-slate-400">i</span>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Technology</span>
                          <span className="text-emerald-300">+2.4%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700">
                          <div className="h-2 w-[84%] rounded-full bg-emerald-300" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Finance</span>
                          <span className="text-emerald-300">+0.8%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700">
                          <div className="h-2 w-[46%] rounded-full bg-emerald-300" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Healthcare</span>
                          <span className="text-rose-300">-1.2%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700">
                          <div className="h-2 w-[26%] rounded-full bg-rose-300" />
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                    <h3 className="text-[30px] font-semibold">Score Distribution</h3>
                    <div className="mt-6 flex h-40 items-end gap-2">
                      {[12, 20, 36, 52, 74, 58, 33, 24, 16, 8].map((height, idx) => (
                        <div
                          key={height}
                          className={idx === 4 ? "w-9 bg-blue-500" : "w-9 bg-slate-700"}
                          style={{ height: `${height}%` }}
                        />
                      ))}
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
                  <button type="button" className="text-slate-300">
                    <Plus size={20} />
                  </button>
                </div>

                <div className="mt-5 space-y-2.5">
                  {watchlistRows.map((item) => (
                    <div
                      key={item.ticker}
                      className="flex items-center justify-between rounded-md border border-slate-800 bg-[#152447] px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded bg-slate-700 px-2 py-1 text-xs font-semibold">{item.ticker}</div>
                        <div>
                          <p className="text-base font-semibold">{item.name}</p>
                          <p className="text-xs text-slate-400">
                            {item.score} Score • {item.signal}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-semibold">{item.price}</p>
                        <p className={item.positive ? "text-xs text-emerald-300" : "text-xs text-rose-300"}>
                          {item.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-md bg-slate-700/70 px-4 py-3 text-sm font-semibold tracking-wide"
                >
                  VIEW FULL WATCHLIST
                </button>

                <article className="mt-7 rounded-lg bg-[#10306e] px-4 py-4">
                  <p className="text-sm font-semibold">PRO INSIGHT</p>
                  <p className="mt-2 text-sm text-slate-200">
                    NVDA score increased by 4 points due to institutional inflow. Bullish momentum
                    building.
                  </p>
                </article>

                <button
                  type="button"
                  className="absolute bottom-[42%] right-[-18px] hidden h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-200 text-blue-950 lg:flex"
                >
                  <MessageSquare size={18} />
                </button>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
