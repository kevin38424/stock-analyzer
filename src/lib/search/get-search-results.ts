import type {
  StockSearchResponse,
  StockSearchResult,
} from "@/features/stocks/types/search";

const SEARCH_UNIVERSE: StockSearchResult[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corp",
    sector: "Technology",
    industry: "Semiconductors",
    exchange: "NASDAQ",
    assetType: "stock",
    marketCapLabel: "$2.14T",
    score: 94,
    sentiment: "BULLISH",
  },
  {
    ticker: "NVDL",
    name: "Direxion Daily NVDA 2X",
    sector: "ETF",
    industry: "Leveraged Equity",
    exchange: "NASDAQ",
    assetType: "etf",
    marketCapLabel: "$1.2B",
    score: 58,
    sentiment: "NEUTRAL",
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    sector: "Technology",
    industry: "Semiconductors",
    exchange: "NASDAQ",
    assetType: "stock",
    marketCapLabel: "$284.1B",
    score: 72,
    sentiment: "STRONG",
  },
  {
    ticker: "TSM",
    name: "TSMC",
    sector: "Technology",
    industry: "Foundries",
    exchange: "NYSE",
    assetType: "stock",
    marketCapLabel: "$724.5B",
    score: 88,
    sentiment: "BULLISH",
  },
  {
    ticker: "SOXX",
    name: "iShares Semiconductor ETF",
    sector: "ETF",
    industry: "Semiconductor Index",
    exchange: "NASDAQ",
    assetType: "etf",
    marketCapLabel: "$13.7B",
    score: 74,
    sentiment: "STRONG",
  },
  {
    ticker: "SMH",
    name: "VanEck Semiconductor ETF",
    sector: "ETF",
    industry: "Semiconductor Index",
    exchange: "NASDAQ",
    assetType: "etf",
    marketCapLabel: "$19.4B",
    score: 76,
    sentiment: "BULLISH",
  },
  {
    ticker: "NVDA260620C00900000",
    name: "NVIDIA Call Option",
    sector: "Derivatives",
    industry: "Equity Call",
    exchange: "OPRA",
    assetType: "option",
    marketCapLabel: "Open Int. 11.8K",
    score: 47,
    sentiment: "NEUTRAL",
  },
  {
    ticker: "INTC",
    name: "Intel Corp",
    sector: "Technology",
    industry: "Semiconductors",
    exchange: "NASDAQ",
    assetType: "stock",
    marketCapLabel: "$221.4B",
    score: 41,
    sentiment: "BEARISH",
  },
];

function sentimentRank(sentiment: StockSearchResult["sentiment"]): number {
  if (sentiment === "BULLISH") return 4;
  if (sentiment === "STRONG") return 3;
  if (sentiment === "NEUTRAL") return 2;
  return 1;
}

function relevanceScore(row: StockSearchResult, query: string): number {
  const normalizedQuery = query.toLowerCase();
  const ticker = row.ticker.toLowerCase();
  const name = row.name.toLowerCase();
  const sector = row.sector.toLowerCase();
  const industry = row.industry.toLowerCase();

  let score = 0;
  if (ticker === normalizedQuery) score += 130;
  if (ticker.startsWith(normalizedQuery)) score += 95;
  if (name.startsWith(normalizedQuery)) score += 80;
  if (ticker.includes(normalizedQuery)) score += 55;
  if (name.includes(normalizedQuery)) score += 40;
  if (industry.includes(normalizedQuery)) score += 25;
  if (sector.includes(normalizedQuery)) score += 15;
  score += row.score / 100;
  score += sentimentRank(row.sentiment) / 10;
  return score;
}

function rowMatchesQuery(row: StockSearchResult, query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  return [row.ticker, row.name, row.sector, row.industry, row.exchange].some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

export function getEmptySearchResponse(query = ""): StockSearchResponse {
  return {
    query,
    total: 0,
    sortedBy: "Relevance",
    categories: [
      { key: "all", label: "All Results", count: 0 },
      { key: "stocks", label: "Stocks", count: 0 },
      { key: "etfs", label: "ETFs", count: 0 },
      { key: "options", label: "Options", count: 0 },
    ],
    trendingSector: {
      name: "Semiconductors",
      changeToday: "+0.0%",
      note: "Start typing to see market-specific search insights.",
    },
    results: [],
  };
}

export function getSearchResults(query: string): StockSearchResponse {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return getEmptySearchResponse("");
  }

  const filtered = SEARCH_UNIVERSE.filter((row) => rowMatchesQuery(row, trimmedQuery)).sort(
    (a, b) => relevanceScore(b, trimmedQuery) - relevanceScore(a, trimmedQuery),
  );

  const stockCount = filtered.filter((row) => row.assetType === "stock").length;
  const etfCount = filtered.filter((row) => row.assetType === "etf").length;
  const optionCount = filtered.filter((row) => row.assetType === "option").length;

  return {
    query: trimmedQuery,
    total: filtered.length,
    sortedBy: "Relevance",
    categories: [
      { key: "all", label: "All Results", count: filtered.length },
      { key: "stocks", label: "Stocks", count: stockCount },
      { key: "etfs", label: "ETFs", count: etfCount },
      { key: "options", label: "Options", count: optionCount },
    ],
    trendingSector: {
      name: "Semiconductors",
      changeToday: "+4.2%",
      note: "Artificial intelligence demand is driving significant volume in NVIDIA-related search queries this week.",
    },
    results: filtered,
  };
}
