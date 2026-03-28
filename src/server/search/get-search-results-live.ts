import { getEmptySearchResponse, getSearchResults as getMockSearchResults } from "@/lib/search/get-search-results";
import { logServerError } from "@/server/observability/log-server-error";
import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";
import { getSearchResultsFromTradier } from "@/server/search/get-search-results-tradier";
import type { SearchCategoryKey, StockSearchResponse } from "@/features/stocks/types/search";

type SearchCardRow = {
  ticker: string;
  company_name: string;
  sector: string | null;
  industry: string | null;
  exchange: string | null;
  asset_type: "stock" | "etf" | "option" | null;
  market_cap: number | null;
  total_score: number | null;
  recommendation: string | null;
};

type SectorPerformanceRow = {
  sector: string;
  change_percent: number;
};

const CATEGORY_TO_ASSET_TYPE: Record<SearchCategoryKey, SearchCardRow["asset_type"] | null> = {
  all: null,
  stocks: "stock",
  etfs: "etf",
  options: "option",
};

function toMarketCapLabel(marketCap: number | null): string {
  if (!marketCap || marketCap <= 0) return "N/A";
  if (marketCap >= 1_000_000_000_000) return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
  if (marketCap >= 1_000_000_000) return `$${(marketCap / 1_000_000_000).toFixed(1)}B`;
  if (marketCap >= 1_000_000) return `$${(marketCap / 1_000_000).toFixed(1)}M`;
  return `$${marketCap.toFixed(0)}`;
}

function toSentiment(
  score: number,
  recommendation: string | null,
): "BULLISH" | "STRONG" | "NEUTRAL" | "BEARISH" {
  const normalizedRecommendation = (recommendation ?? "").toUpperCase();
  if (normalizedRecommendation.includes("STRONG")) return "BULLISH";
  if (normalizedRecommendation.includes("BUY")) return "STRONG";
  if (normalizedRecommendation.includes("SELL")) return "BEARISH";
  if (score >= 80) return "BULLISH";
  if (score >= 60) return "STRONG";
  if (score >= 40) return "NEUTRAL";
  return "BEARISH";
}

function applyCategoryFilter(rows: SearchCardRow[], category: SearchCategoryKey): SearchCardRow[] {
  if (category === "all") return rows;
  const assetType = CATEGORY_TO_ASSET_TYPE[category];
  return rows.filter((row) => row.asset_type === assetType);
}

function relevanceScore(row: SearchCardRow, query: string): number {
  const normalizedQuery = query.toLowerCase();
  const ticker = row.ticker.toLowerCase();
  const companyName = row.company_name.toLowerCase();
  const sector = (row.sector ?? "").toLowerCase();
  const industry = (row.industry ?? "").toLowerCase();
  const score = Number(row.total_score ?? 0);

  let relevance = 0;
  if (ticker === normalizedQuery) relevance += 130;
  if (ticker.startsWith(normalizedQuery)) relevance += 95;
  if (companyName.startsWith(normalizedQuery)) relevance += 80;
  if (ticker.includes(normalizedQuery)) relevance += 55;
  if (companyName.includes(normalizedQuery)) relevance += 40;
  if (industry.includes(normalizedQuery)) relevance += 25;
  if (sector.includes(normalizedQuery)) relevance += 15;
  relevance += score / 100;
  return relevance;
}

function categoryCountsFromRows(rows: SearchCardRow[]) {
  return {
    all: rows.length,
    stocks: rows.filter((row) => row.asset_type === "stock").length,
    etfs: rows.filter((row) => row.asset_type === "etf").length,
    options: rows.filter((row) => row.asset_type === "option").length,
  };
}

function withFallbackFilterAndLimit(
  data: StockSearchResponse,
  category: SearchCategoryKey,
  limit: number,
): StockSearchResponse {
  const allResults = data.results;
  const categoryCounts = {
    all: allResults.length,
    stocks: allResults.filter((row) => row.assetType === "stock").length,
    etfs: allResults.filter((row) => row.assetType === "etf").length,
    options: allResults.filter((row) => row.assetType === "option").length,
  };

  const filteredByCategory =
    category === "all"
      ? allResults
      : allResults.filter((row) => {
          if (category === "stocks") return row.assetType === "stock";
          if (category === "etfs") return row.assetType === "etf";
          return row.assetType === "option";
        });

  const limited = filteredByCategory.slice(0, limit);

  return {
    ...data,
    total: filteredByCategory.length,
    results: limited,
    categories: [
      { key: "all", label: "All Results", count: categoryCounts.all },
      { key: "stocks", label: "Stocks", count: categoryCounts.stocks },
      { key: "etfs", label: "ETFs", count: categoryCounts.etfs },
      { key: "options", label: "Options", count: categoryCounts.options },
    ],
  };
}

function fallbackSearch(
  query: string,
  category: SearchCategoryKey,
  limit: number,
  includeTrending: boolean,
): StockSearchResponse {
  const base = query.trim() ? getMockSearchResults(query) : getEmptySearchResponse(query);
  const filtered = withFallbackFilterAndLimit(base, category, limit);
  if (includeTrending) return filtered;
  return {
    ...filtered,
    trendingSector: {
      name: "N/A",
      changeToday: "N/A",
      note: "Trending sector is disabled for this request.",
    },
  };
}

export async function getSearchResultsLive(options: {
  query: string;
  category: SearchCategoryKey;
  limit: number;
  includeTrending: boolean;
}): Promise<StockSearchResponse> {
  const trimmedQuery = options.query.trim();
  if (!trimmedQuery) {
    return getEmptySearchResponse("");
  }

  const tradierSearchFallbackEnabled = process.env.TRADIER_SEARCH_FALLBACK_ENABLED === "true";

  if (!hasServerSupabaseEnv()) {
    if (tradierSearchFallbackEnabled) {
      try {
        const tradierData = await getSearchResultsFromTradier({
          query: trimmedQuery,
          category: options.category,
          limit: options.limit,
          includeTrending: options.includeTrending,
        });
        if (tradierData) return tradierData;
      } catch (error) {
        logServerError("search.getSearchResultsLive.tradierFallback", error, {
          query: trimmedQuery,
          category: options.category,
          limit: options.limit,
          includeTrending: options.includeTrending,
        });
      }
    }

    return fallbackSearch(trimmedQuery, options.category, options.limit, options.includeTrending);
  }

  try {
    const supabase = createServerSupabaseClient();
    const cardsQuery = supabase
      .from("v_search_cards_latest")
      .select("ticker, company_name, sector, industry, exchange, asset_type, market_cap, total_score, recommendation")
      .or(
        [
          `ticker.ilike.%${trimmedQuery}%`,
          `company_name.ilike.%${trimmedQuery}%`,
          `sector.ilike.%${trimmedQuery}%`,
          `industry.ilike.%${trimmedQuery}%`,
        ].join(","),
      )
      .limit(Math.max(options.limit, 500));

    const [cardsResult, trendingResult] = await Promise.all([
      cardsQuery,
      options.includeTrending
        ? supabase
            .from("sector_performance_daily")
            .select("sector, change_percent")
            .order("as_of_date", { ascending: false })
            .order("rank", { ascending: true })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (cardsResult.error) {
      return fallbackSearch(trimmedQuery, options.category, options.limit, options.includeTrending);
    }

    const rows = ((cardsResult.data ?? []) as SearchCardRow[]).sort(
      (a, b) => relevanceScore(b, trimmedQuery) - relevanceScore(a, trimmedQuery),
    );
    const counts = categoryCountsFromRows(rows);
    const filteredRows = applyCategoryFilter(rows, options.category);
    const limitedRows = filteredRows.slice(0, options.limit);

    const trending = trendingResult.data as SectorPerformanceRow | null;
    const changePercent = trending?.change_percent ?? 0;
    const trendSign = changePercent >= 0 ? "+" : "";

    return {
      query: trimmedQuery,
      total: filteredRows.length,
      sortedBy: "Relevance",
      categories: [
        { key: "all", label: "All Results", count: counts.all },
        { key: "stocks", label: "Stocks", count: counts.stocks },
        { key: "etfs", label: "ETFs", count: counts.etfs },
        { key: "options", label: "Options", count: counts.options },
      ],
      trendingSector: options.includeTrending
        ? {
            name: trending?.sector ?? "Semiconductors",
            changeToday: `${trendSign}${changePercent.toFixed(1)}%`,
            note: "Sector momentum reflects latest market breadth in the daily snapshot.",
          }
        : {
            name: "N/A",
            changeToday: "N/A",
            note: "Trending sector is disabled for this request.",
          },
      results: limitedRows.map((row) => {
        const score = Number(row.total_score ?? 0);
        return {
          ticker: row.ticker,
          name: row.company_name,
          sector: row.sector ?? "Unknown",
          industry: row.industry ?? "Unknown",
          exchange: row.exchange ?? "N/A",
          assetType: row.asset_type ?? "stock",
          marketCapLabel: toMarketCapLabel(row.market_cap),
          score,
          sentiment: toSentiment(score, row.recommendation),
        };
      }),
    };
  } catch (error) {
    logServerError("search.getSearchResultsLive", error, {
      query: trimmedQuery,
      category: options.category,
      limit: options.limit,
      includeTrending: options.includeTrending,
    });
    return fallbackSearch(trimmedQuery, options.category, options.limit, options.includeTrending);
  }
}
