import { getMockTopStocksPageData } from "@/lib/mock-data";
import { logServerError } from "@/server/observability/log-server-error";
import { toTopStocksFeaturedRecommendation, toTopStocksRowRecommendation } from "@/server/recommendations";
import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";
import { ensureFreshQuotesForTickers } from "@/server/market-data/quote-sync";
import type { TopStocksPagePayload, TopStocksQuery, TopStocksRow } from "@/features/stocks/types/top-stocks";

type TopStockCardRow = {
  as_of_date: string;
  rank: number;
  company_id: string;
  ticker: string;
  company_name: string;
  sector: string | null;
  industry: string | null;
  total_score: number;
  recommendation: string;
  valuation_style: TopStocksQuery["valuationStyle"];
  price: number | null;
  change_percent: number | null;
  fundamentals_score: number | null;
  momentum_score: number | null;
  sentiment_score: number | null;
  value_score: number | null;
  why_it_ranks: string | null;
  algorithm_note: string | null;
};

function buildFromRows(
  rows: TopStockCardRow[],
  query: TopStocksQuery,
  favorites: Set<string>,
  totalUniverseCount: number,
): TopStocksPagePayload {
  const filteredByFavorites = query.favoritesOnly
    ? rows.filter((row) => favorites.has(row.company_id))
    : rows;

  const ranked = filteredByFavorites
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .map((row, index) => ({
      ...row,
      displayRank: index + 1,
      isFavorite: favorites.has(row.company_id),
    }));

  const start = query.offset;
  const end = query.offset + query.limit;
  const pageRows = ranked.slice(start, end);
  const nextOffset = end < ranked.length ? end : null;

  const featured = ranked[0] ?? null;
  const sectors = Array.from(
    new Set(ranked.map((row) => row.sector).filter((sector): sector is string => Boolean(sector))),
  ).sort((a, b) => a.localeCompare(b));

  return {
    summary: {
      title: "Top Stocks",
      subtitle:
        "Ranked by proprietary ScoreEngine analytics combining fundamentals, momentum, and institutional sentiment.",
      asOfDate: featured?.as_of_date ?? new Date().toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      totalUniverseCount,
      filteredCount: ranked.length,
    },
    filterMetadata: {
      sectors: ["all", ...sectors],
      valuationStyles: ["growth", "value", "income"],
      scoreRange: { min: 0, max: 100 },
    },
    algorithmNote:
      featured?.algorithm_note ??
      "Current ranking weights prioritize durable fundamentals with secondary momentum adjustments.",
    featured: {
      rank: featured?.displayRank ?? 1,
      ticker: featured?.ticker ?? "N/A",
      companyName: featured?.company_name ?? "No ranking data",
      sector: featured?.sector ?? "Unknown",
      industry: featured?.industry ?? "Unknown",
      score: Number(featured?.total_score ?? 0),
      recommendation: toTopStocksFeaturedRecommendation(featured?.recommendation),
      price: Number(featured?.price ?? 0),
      changePercent: Number(featured?.change_percent ?? 0),
      whyItRanks:
        featured?.why_it_ranks ??
        "Ranking narrative is unavailable for this snapshot. Falling back to quantitative score ordering.",
      factors: {
        fundamentals: Number(featured?.fundamentals_score ?? 0),
        momentum: Number(featured?.momentum_score ?? 0),
        sentiment: Number(featured?.sentiment_score ?? 0),
        valueScore: Number(featured?.value_score ?? 0),
      },
    },
    rows: pageRows.map((row) => ({
      rank: row.displayRank,
      ticker: row.ticker,
      companyName: row.company_name,
      sector: row.sector ?? "Unknown",
      industry: row.industry ?? "Unknown",
      score: Number(row.total_score),
      recommendation: toTopStocksRowRecommendation(row.recommendation),
      price: Number(row.price ?? 0),
      changePercent: Number(row.change_percent ?? 0),
      isFavorite: row.isFavorite,
    })),
    page: {
      limit: query.limit,
      offset: query.offset,
      nextOffset,
      hasMore: nextOffset !== null,
    },
  };
}

export async function getTopStocksPageData(query: TopStocksQuery): Promise<TopStocksPagePayload> {
  if (!hasServerSupabaseEnv()) {
    return getMockTopStocksPageData(query);
  }

  try {
    const supabase = createServerSupabaseClient();

    let cardsQuery = supabase
      .from("v_top_stock_cards_latest")
      .select(
        "as_of_date, rank, company_id, ticker, company_name, sector, industry, total_score, recommendation, valuation_style, price, change_percent, fundamentals_score, momentum_score, sentiment_score, value_score, why_it_ranks, algorithm_note",
      )
      .eq("valuation_style", query.valuationStyle)
      .gte("total_score", query.minScore)
      .lte("total_score", query.maxScore)
      .order("rank", { ascending: true });

    if (query.sector !== "all") {
      cardsQuery = cardsQuery.eq("sector", query.sector);
    }

    const [{ data: cards, error: cardsError }, { data: marketSummary }] = await Promise.all([
      cardsQuery,
      supabase
        .from("market_daily_summary")
        .select("stocks_analyzed")
        .order("as_of_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (cardsError || !cards) {
      return getMockTopStocksPageData(query);
    }

    const favorites = new Set<string>();
    if (query.userId) {
      const { data: favoriteRows } = await supabase
        .from("user_favorites")
        .select("company_id")
        .eq("user_id", query.userId);

      for (const favorite of favoriteRows ?? []) {
        if (favorite.company_id) favorites.add(favorite.company_id);
      }
    }

    const cardRows = cards as TopStockCardRow[];
    const liveQuotes = await ensureFreshQuotesForTickers(cardRows.map((row) => row.ticker), { supabase });
    const hydratedRows = cardRows.map((row) => {
      const live = liveQuotes.get(row.ticker.toUpperCase());
      if (!live) return row;

      return {
        ...row,
        price: live.price,
        change_percent: live.changePercent,
      };
    });

    return buildFromRows(hydratedRows, query, favorites, marketSummary?.stocks_analyzed ?? cards.length);
  } catch (error) {
    logServerError("topStocks.getTopStocksPageData", error, { query });
    return getMockTopStocksPageData(query);
  }
}
