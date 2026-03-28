import type { HomeDashboardResponse, HomeWatchlistRow } from "@/features/home/types/dashboard";
import { getHomeDashboardData as getMockHomeDashboardData } from "@/server/home/get-home-dashboard-data";
import { toHomeTopStockRecommendation, toHomeWatchlistSignal } from "@/server/recommendations";
import { logServerError } from "@/server/observability/log-server-error";
import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";
import { ensureFreshQuotesForTickers } from "@/server/market-data/quote-sync";

type TopStockCardRow = {
  rank: number;
  ticker: string;
  company_name: string;
  sector: string | null;
  total_score: number;
  recommendation: string | null;
  price: number | null;
  change_percent: number | null;
};

type SectorRow = { sector: string; change_percent: number };
type DistributionRow = { bin_start: number; bin_end: number; count: number };

type MarketSummaryRow = {
  stocks_analyzed: number;
  stocks_analyzed_delta: number;
  strong_buys: number;
  strong_buys_percent: number;
  average_score: number;
  most_improved_delta_score: number | null;
  generated_at: string;
  company: { ticker: string | null } | null;
};

export async function getHomeDashboardDataLive(options: {
  includeWatchlist: boolean;
  userId: string | null;
}): Promise<HomeDashboardResponse> {
  if (!hasServerSupabaseEnv()) {
    const mock = getMockHomeDashboardData();
    return options.includeWatchlist ? mock : { ...mock, watchlistPreview: [] };
  }

  try {
    const supabase = createServerSupabaseClient();

    const latestSummaryQuery = supabase
      .from("market_daily_summary")
      .select(
        "stocks_analyzed, stocks_analyzed_delta, strong_buys, strong_buys_percent, average_score, most_improved_delta_score, generated_at, company:companies!market_daily_summary_most_improved_company_id_fkey(ticker)",
      )
      .order("as_of_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const topStocksQuery = supabase
      .from("v_top_stock_cards_latest")
      .select("rank, ticker, company_name, sector, total_score, recommendation, price, change_percent")
      .eq("valuation_style", "growth")
      .order("rank", { ascending: true })
      .limit(4);

    const sectorQuery = supabase
      .from("sector_performance_daily")
      .select("sector, change_percent")
      .order("as_of_date", { ascending: false })
      .order("rank", { ascending: true })
      .limit(3);

    const distributionQuery = supabase
      .from("score_distribution_daily")
      .select("bin_start, bin_end, count")
      .order("as_of_date", { ascending: false })
      .order("bin_start", { ascending: true })
      .limit(10);

    const watchlistQuery =
      options.includeWatchlist && options.userId
        ? supabase
            .from("v_watchlist_rows_latest")
            .select("ticker, company_name, score, recommendation, price, change_percent")
            .eq("user_id", options.userId)
            .order("score", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>>, error: null });

    const [summaryResult, topStocksResult, sectorResult, distributionResult, watchlistResult] = await Promise.all([
      latestSummaryQuery,
      topStocksQuery,
      sectorQuery,
      distributionQuery,
      watchlistQuery,
    ]);

    if (summaryResult.error || topStocksResult.error || sectorResult.error || distributionResult.error) {
      const mock = getMockHomeDashboardData();
      return options.includeWatchlist ? mock : { ...mock, watchlistPreview: [] };
    }

    const summary = summaryResult.data as MarketSummaryRow | null;
    const topRows = (topStocksResult.data ?? []) as TopStockCardRow[];
    const sectorRows = (sectorResult.data ?? []) as SectorRow[];
    const distributionRows = (distributionResult.data ?? []) as DistributionRow[];

    const watchlistRows = (watchlistResult.data ?? []) as Array<{
      ticker: string;
      company_name: string;
      score: number | null;
      recommendation: string | null;
      price: number | null;
      change_percent: number | null;
    }>;

    const uniqueTickers = Array.from(new Set([...topRows.map((row) => row.ticker), ...watchlistRows.map((row) => row.ticker)]));
    const liveQuotes = await ensureFreshQuotesForTickers(uniqueTickers, { supabase });

    return {
      generatedAt: summary?.generated_at ?? new Date().toISOString(),
      kpis: {
        stocksAnalyzed: summary?.stocks_analyzed ?? 0,
        stocksAnalyzedDelta: summary?.stocks_analyzed_delta ?? 0,
        strongBuys: summary?.strong_buys ?? 0,
        strongBuysPercent: Number(summary?.strong_buys_percent ?? 0),
        averageScore: Number(summary?.average_score ?? 0),
        mostImprovedTicker: summary?.company?.ticker ?? "N/A",
        mostImprovedDeltaScore: Number(summary?.most_improved_delta_score ?? 0),
        watchlistAlerts: 0,
      },
      topStocks: topRows.map((row) => {
        const live = liveQuotes.get(row.ticker.toUpperCase());
        return {
          rank: row.rank,
          ticker: row.ticker,
          companyName: row.company_name,
          sector: row.sector ?? "Unknown",
          score: Number(row.total_score),
          recommendation: toHomeTopStockRecommendation(row.recommendation),
          price: Number(live?.price ?? row.price ?? 0),
          changePercent: Number(live?.changePercent ?? row.change_percent ?? 0),
        };
      }),
      watchlistPreview: options.includeWatchlist
        ? watchlistRows.map((row) => {
            const live = liveQuotes.get(row.ticker.toUpperCase());
            return {
              ticker: row.ticker,
              companyName: row.company_name,
              score: Number(row.score ?? 0),
              signal: toHomeWatchlistSignal(row.recommendation),
              price: Number(live?.price ?? row.price ?? 0),
              changePercent: Number(live?.changePercent ?? row.change_percent ?? 0),
            };
          })
        : [],
      sectorPerformance: sectorRows.map((row) => ({
        sector: row.sector,
        changePercent: Number(row.change_percent),
      })),
      scoreDistribution: distributionRows.map((row) => ({
        binStart: row.bin_start,
        binEnd: row.bin_end,
        count: row.count,
      })),
      insight: {
        title: "PRO INSIGHT",
        message:
          topRows[0] && topRows[1]
            ? `${topRows[0].ticker} currently leads the ranking universe with ${topRows[0].total_score.toFixed(1)} while sector breadth remains active.`
            : "Daily insight is temporarily unavailable while ranking snapshots are loading.",
      },
    };
  } catch (error) {
    logServerError("home.getHomeDashboardDataLive", error, {
      includeWatchlist: options.includeWatchlist,
      userId: options.userId,
    });
    const mock = getMockHomeDashboardData();
    return options.includeWatchlist ? mock : { ...mock, watchlistPreview: [] };
  }
}
