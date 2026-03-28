import type {
  WatchlistPagePayload,
  WatchlistQuery,
  WatchlistRow,
  WatchlistSegment,
} from "@/features/watchlist/types/watchlist";

const baseRows: WatchlistRow[] = [
  {
    ticker: "NVDA",
    companyName: "NVIDIA Corp.",
    sector: "Semiconductors",
    segment: "tech_growth",
    score: 94,
    deltaScore: 3,
    price: 124.52,
    changePercent: 2.41,
    recommendation: "STRONG BUY",
    thesis: "AI infrastructure demand remains strong with hyperscaler capex still expanding.",
  },
  {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    sector: "Consumer Tech",
    segment: "all_holdings",
    score: 78,
    deltaScore: 0,
    price: 228.14,
    changePercent: -0.45,
    recommendation: "HOLD",
    thesis: "Services growth offsets hardware softness, but valuation leaves less upside buffer.",
  },
  {
    ticker: "TSLA",
    companyName: "Tesla, Inc.",
    sector: "Automotive",
    segment: "speculative",
    score: 45,
    deltaScore: -12,
    price: 246.39,
    changePercent: -3.82,
    recommendation: "AVOID",
    thesis: "Margin compression and intensifying EV competition weaken near-term conviction.",
  },
  {
    ticker: "PLTR",
    companyName: "Palantir Tech.",
    sector: "Enterprise Software",
    segment: "tech_growth",
    score: 82,
    deltaScore: 15,
    price: 30.12,
    changePercent: 5.12,
    recommendation: "BUY",
    thesis: "AIP monetization momentum and large enterprise expansion support higher growth durability.",
  },
];

const segmentLabels: Record<WatchlistSegment, string> = {
  all_holdings: "All Holdings",
  tech_growth: "Tech Growth",
  dividends: "Dividends",
  speculative: "Speculative",
};

function sortRows(rows: WatchlistRow[], sortBy: WatchlistQuery["sortBy"]): WatchlistRow[] {
  const sorted = [...rows];

  sorted.sort((a, b) => {
    if (sortBy === "score_desc") return b.score - a.score;
    if (sortBy === "score_asc") return a.score - b.score;
    if (sortBy === "delta_desc") return b.deltaScore - a.deltaScore;
    if (sortBy === "delta_asc") return a.deltaScore - b.deltaScore;
    if (sortBy === "price_desc") return b.price - a.price;
    return a.price - b.price;
  });

  return sorted;
}

function filterBySegment(rows: WatchlistRow[], segment: WatchlistSegment): WatchlistRow[] {
  if (segment === "all_holdings") return rows;
  return rows.filter((row) => row.segment === segment);
}

export function getMockWatchlistPageData(query: WatchlistQuery): WatchlistPagePayload {
  const filtered = filterBySegment(baseRows, query.segment);
  const rows = sortRows(filtered, query.sortBy);

  const avgScore = rows.length
    ? Number((rows.reduce((sum, row) => sum + row.score, 0) / rows.length).toFixed(1))
    : 0;

  const topPick = rows[0] ?? null;
  const bigUpgrade = [...rows].sort((a, b) => b.deltaScore - a.deltaScore)[0] ?? null;
  const atRisk = [...rows].sort((a, b) => a.deltaScore - b.deltaScore)[0] ?? null;

  return {
    summary: {
      title: "My Watchlist",
      subtitle:
        "Real-time performance tracking and proprietary conviction scores for your high-conviction assets.",
      generatedAt: new Date().toISOString(),
    },
    kpis: {
      averageScore: {
        label: "AVG SCORE",
        value: avgScore.toFixed(1),
        detail: rows.length ? "+2.1" : "+0.0",
      },
      topPick: {
        label: "TOP PICK",
        value: topPick?.ticker ?? "-",
        detail: topPick ? String(topPick.score) : undefined,
        ticker: topPick?.ticker,
      },
      bigUpgrade: {
        label: "BIG UPGRADE",
        value: bigUpgrade?.ticker ?? "-",
        detail: bigUpgrade ? `+${bigUpgrade.deltaScore}` : undefined,
        ticker: bigUpgrade?.ticker,
      },
      atRisk: {
        label: "AT RISK",
        value: atRisk?.ticker ?? "-",
        detail: atRisk ? String(atRisk.score) : undefined,
        ticker: atRisk?.ticker,
      },
    },
    filters: {
      segments: (Object.keys(segmentLabels) as WatchlistSegment[]).map((id) => ({
        id,
        label: segmentLabels[id],
      })),
      selectedSegment: query.segment,
      sortBy: query.sortBy,
    },
    rows,
    totalTracked: baseRows.length,
  };
}
