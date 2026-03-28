import type {
  WatchlistPagePayload,
  WatchlistQuery,
  WatchlistRow,
  WatchlistSegment,
} from "@/features/watchlist/types/watchlist";
import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";
import { toWatchlistRecommendation } from "@/server/recommendations";
import { logServerError } from "@/server/observability/log-server-error";
import { getMockWatchlistPageData } from "@/lib/watchlist/get-watchlist-page-data";
import { ensureFreshQuotesForTickers } from "@/server/market-data/quote-sync";

type WatchlistLatestRow = {
  user_id: string;
  company_id: string | null;
  ticker: string;
  company_name: string;
  sector: string | null;
  segment: WatchlistSegment;
  thesis: string | null;
  score: number | null;
  price: number | null;
  change_percent: number | null;
  delta_score: number | null;
  recommendation: string | null;
  created_at: string;
};

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

function buildPayload(rows: WatchlistRow[], query: WatchlistQuery, totalTracked: number): WatchlistPagePayload {
  const filtered = query.segment === "all_holdings" ? rows : rows.filter((row) => row.segment === query.segment);
  const sorted = sortRows(filtered, query.sortBy);

  const avgScore = sorted.length
    ? Number((sorted.reduce((sum, row) => sum + row.score, 0) / sorted.length).toFixed(1))
    : 0;

  const topPick = sorted[0] ?? null;
  const bigUpgrade = [...sorted].sort((a, b) => b.deltaScore - a.deltaScore)[0] ?? null;
  const atRisk = [...sorted].sort((a, b) => a.deltaScore - b.deltaScore)[0] ?? null;

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
        detail: sorted.length ? "+0.0" : undefined,
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
        detail: bigUpgrade ? `${bigUpgrade.deltaScore >= 0 ? "+" : ""}${bigUpgrade.deltaScore}` : undefined,
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
      segments: (Object.keys(segmentLabels) as WatchlistSegment[]).map((id) => ({ id, label: segmentLabels[id] })),
      selectedSegment: query.segment,
      sortBy: query.sortBy,
    },
    rows: sorted,
    totalTracked,
  };
}

export async function getWatchlistPageData(query: WatchlistQuery): Promise<WatchlistPagePayload> {
  if (!query.userId || !hasServerSupabaseEnv()) {
    return getMockWatchlistPageData(query);
  }

  try {
    const supabase = createServerSupabaseClient();

    const [{ data: rows, error }, { count: totalTracked }] = await Promise.all([
      supabase
        .from("v_watchlist_rows_latest")
        .select(
          "user_id, company_id, ticker, company_name, sector, segment, thesis, score, price, change_percent, delta_score, recommendation, created_at",
        )
        .eq("user_id", query.userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("v_watchlist_rows_latest")
        .select("ticker", { count: "exact", head: true })
        .eq("user_id", query.userId),
    ]);

    if (error || !rows) {
      return getMockWatchlistPageData(query);
    }

    const typedRows = rows as WatchlistLatestRow[];
    const liveQuotes = await ensureFreshQuotesForTickers(
      typedRows.map((row) => row.ticker),
      { supabase },
    );

    const normalizedRows: WatchlistRow[] = typedRows.map((row) => {
      const live = liveQuotes.get(row.ticker.toUpperCase());

      return {
        ticker: row.ticker.toUpperCase(),
        companyName: row.company_name,
        sector: row.sector ?? "Unknown",
        segment: row.segment,
        score: Number(row.score ?? 0),
        deltaScore: Number(row.delta_score ?? 0),
        price: Number(live?.price ?? row.price ?? 0),
        changePercent: Number(live?.changePercent ?? row.change_percent ?? 0),
        recommendation: toWatchlistRecommendation(row.recommendation),
        thesis: row.thesis ?? "No thesis added yet.",
      };
    });

    return buildPayload(normalizedRows, query, totalTracked ?? normalizedRows.length);
  } catch (error) {
    logServerError("watchlist.getWatchlistPageData", error, { query });
    return getMockWatchlistPageData(query);
  }
}
