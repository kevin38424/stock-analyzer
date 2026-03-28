import { calculateCompositeScore } from "@/lib/scoring";
import type { RawStockMetrics } from "@/types/stock";
import type {
  TopStocksPagePayload,
  TopStocksQuery,
  TopStocksRow,
  ValuationStyle,
} from "@/features/stocks/types/top-stocks";

const mockStocks: RawStockMetrics[] = [
  {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    peRatio: 28,
    pbRatio: 42,
    psRatio: 7,
    evEbitda: 20,
    pegRatio: 2.1,
    grossMargin: 46,
    netMargin: 25,
    roe: 150,
    roa: 29,
    revenueGrowthYoy: 6,
    epsGrowth: 9,
    fcfGrowth: 8,
    debtToEquity: 1.5,
    currentRatio: 1.1,
    interestCoverage: 30,
    fcfYield: 3.6,
    week52Position: 0.72,
    rsi: 49,
    priceVs200DayMa: 7,
    analystConsensus: 77,
    newsSentiment: 63,
    insiderBuyingScore: 40,
  },
  {
    ticker: "MSFT",
    companyName: "Microsoft Corporation",
    sector: "Technology",
    peRatio: 31,
    pbRatio: 11,
    psRatio: 12,
    evEbitda: 22,
    pegRatio: 2,
    grossMargin: 69,
    netMargin: 36,
    roe: 34,
    roa: 18,
    revenueGrowthYoy: 13,
    epsGrowth: 16,
    fcfGrowth: 12,
    debtToEquity: 0.35,
    currentRatio: 1.4,
    interestCoverage: 38,
    fcfYield: 2.9,
    week52Position: 0.63,
    rsi: 46,
    priceVs200DayMa: 4,
    analystConsensus: 84,
    newsSentiment: 74,
    insiderBuyingScore: 52,
  },
  {
    ticker: "GOOGL",
    companyName: "Alphabet Inc.",
    sector: "Communication Services",
    peRatio: 24,
    pbRatio: 6.2,
    psRatio: 6.1,
    evEbitda: 16,
    pegRatio: 1.4,
    grossMargin: 58,
    netMargin: 24,
    roe: 28,
    roa: 16,
    revenueGrowthYoy: 12,
    epsGrowth: 18,
    fcfGrowth: 10,
    debtToEquity: 0.1,
    currentRatio: 1.8,
    interestCoverage: 50,
    fcfYield: 4.2,
    week52Position: 0.49,
    rsi: 41,
    priceVs200DayMa: -2,
    analystConsensus: 86,
    newsSentiment: 68,
    insiderBuyingScore: 64,
  }
];

export function getMockStockMetrics(ticker: string) {
  return mockStocks.find((stock) => stock.ticker === ticker) ?? null;
}

export function getMockTopStocks() {
  return mockStocks
    .map((stock) => ({
      ticker: stock.ticker,
      companyName: stock.companyName,
      sector: stock.sector,
      analysis: calculateCompositeScore(stock),
    }))
    .sort((a, b) => b.analysis.total - a.analysis.total);
}

const baseTopStocksRows: TopStocksRow[] = [
  {
    rank: 1,
    ticker: "NVDA",
    companyName: "Nvidia Corp.",
    sector: "Technology",
    industry: "Semiconductors",
    score: 98,
    recommendation: "BUY",
    price: 822.79,
    changePercent: 4.25,
    isFavorite: true,
  },
  {
    rank: 2,
    ticker: "MSFT",
    companyName: "Microsoft Corp.",
    sector: "Technology",
    industry: "Systems Software",
    score: 94,
    recommendation: "BUY",
    price: 415.5,
    changePercent: 1.12,
    isFavorite: false,
  },
  {
    rank: 3,
    ticker: "ASML",
    companyName: "ASML Holding",
    sector: "Technology",
    industry: "Semiconductor Equipment",
    score: 91,
    recommendation: "BUY",
    price: 942.1,
    changePercent: -0.45,
    isFavorite: false,
  },
  {
    rank: 4,
    ticker: "LLY",
    companyName: "Eli Lilly & Co.",
    sector: "Healthcare",
    industry: "Drug Manufacturers",
    score: 89,
    recommendation: "BUY",
    price: 764.2,
    changePercent: 2.88,
    isFavorite: true,
  },
  {
    rank: 5,
    ticker: "V",
    companyName: "Visa Inc.",
    sector: "Financial Services",
    industry: "Credit Services",
    score: 86,
    recommendation: "HOLD",
    price: 282.15,
    changePercent: 0.15,
    isFavorite: false,
  },
  {
    rank: 6,
    ticker: "COST",
    companyName: "Costco Wholesale",
    sector: "Consumer Defensive",
    industry: "Discount Stores",
    score: 84,
    recommendation: "HOLD",
    price: 707.66,
    changePercent: -0.22,
    isFavorite: false,
  },
];

function rowSupportsValuationStyle(row: TopStocksRow, valuationStyle: ValuationStyle): boolean {
  if (valuationStyle === "growth") {
    return row.sector === "Technology" || row.sector === "Healthcare";
  }
  if (valuationStyle === "income") {
    return row.sector === "Financial Services" || row.ticker === "COST";
  }
  return true;
}

export function getMockTopStocksPageData(query: TopStocksQuery): TopStocksPagePayload {
  const filtered = baseTopStocksRows.filter((row) => {
    if (query.favoritesOnly && !row.isFavorite) return false;
    if (row.score < query.minScore || row.score > query.maxScore) return false;
    if (query.sector !== "all" && row.sector.toLowerCase() !== query.sector.toLowerCase()) return false;
    if (!rowSupportsValuationStyle(row, query.valuationStyle)) return false;
    return true;
  });

  const ranked = filtered
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const featured = ranked[0] ?? baseTopStocksRows[0];
  const start = query.offset;
  const end = query.offset + query.limit;
  const rows = ranked.slice(start, end);
  const nextOffset = end < ranked.length ? end : null;

  return {
    summary: {
      title: "Top Stocks",
      subtitle:
        "Ranked by proprietary ScoreEngine analytics combining fundamentals, momentum, and institutional sentiment.",
      asOfDate: "2026-03-28",
      generatedAt: new Date().toISOString(),
      totalUniverseCount: 500,
      filteredCount: ranked.length,
    },
    filterMetadata: {
      sectors: ["all", "Technology", "Healthcare", "Financial Services", "Consumer Defensive"],
      valuationStyles: ["growth", "value", "income"],
      scoreRange: { min: 0, max: 100 },
    },
    algorithmNote:
      "Currently prioritizing momentum-heavy assets due to recent macro shifts in core inflation data.",
    featured: {
      rank: featured.rank,
      ticker: featured.ticker,
      companyName: featured.companyName,
      sector: featured.sector,
      industry: featured.industry,
      score: featured.score,
      recommendation: featured.score >= 95 ? "STRONG BUY" : featured.recommendation,
      price: featured.price,
      changePercent: featured.changePercent,
      whyItRanks:
        "Exceptionally high free cash flow conversion coupled with dominant market share in AI compute. Sentiment is near all-time highs with institutional accumulation continuing through the current quarter.",
      factors: {
        fundamentals: 78,
        momentum: 95,
        sentiment: 84,
        valueScore: 44,
      },
    },
    rows,
    page: {
      limit: query.limit,
      offset: query.offset,
      nextOffset,
      hasMore: nextOffset !== null,
    },
  };
}
