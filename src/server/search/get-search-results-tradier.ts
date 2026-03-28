import type { SearchCategoryKey, StockSearchResponse } from "@/features/stocks/types/search";
import { createTradierClientFromEnv, type TradierSearchSecurity } from "@/server/tradier/client";

function toAssetType(type: TradierSearchSecurity["type"]): "stock" | "etf" | "option" {
  const normalized = type.toLowerCase();
  if (normalized.includes("option")) return "option";
  if (normalized.includes("etf") || normalized.includes("fund")) return "etf";
  return "stock";
}

function applyCategoryFilter<T extends { assetType: "stock" | "etf" | "option" }>(
  rows: T[],
  category: SearchCategoryKey,
): T[] {
  if (category === "all") return rows;
  const target = category === "stocks" ? "stock" : category === "etfs" ? "etf" : "option";
  return rows.filter((row) => row.assetType === target);
}

function dedupeByTicker(rows: TradierSearchSecurity[]): TradierSearchSecurity[] {
  const seen = new Set<string>();
  const deduped: TradierSearchSecurity[] = [];
  for (const row of rows) {
    if (seen.has(row.symbol)) continue;
    seen.add(row.symbol);
    deduped.push(row);
  }
  return deduped;
}

export async function getSearchResultsFromTradier(options: {
  query: string;
  category: SearchCategoryKey;
  limit: number;
  includeTrending: boolean;
}): Promise<StockSearchResponse | null> {
  const client = createTradierClientFromEnv();
  if (!client) return null;

  const q = options.query.trim();
  if (!q) return null;

  const [searchRows, lookupRows] = await Promise.all([
    client.searchSecurities(q),
    client.lookupSecurities(q),
  ]);

  const merged = dedupeByTicker([...searchRows, ...lookupRows]);
  const mapped = merged.map((row) => ({
    ticker: row.symbol,
    name: row.description,
    sector: "Unknown",
    industry: "Unknown",
    exchange: row.exchange ?? "N/A",
    assetType: toAssetType(row.type),
    marketCapLabel: "N/A",
    score: 0,
    sentiment: "NEUTRAL" as const,
  }));

  const filtered = applyCategoryFilter(mapped, options.category);
  const limited = filtered.slice(0, options.limit);
  const counts = {
    all: mapped.length,
    stocks: mapped.filter((row) => row.assetType === "stock").length,
    etfs: mapped.filter((row) => row.assetType === "etf").length,
    options: mapped.filter((row) => row.assetType === "option").length,
  };

  return {
    query: q,
    total: filtered.length,
    sortedBy: "Relevance",
    categories: [
      { key: "all", label: "All Results", count: counts.all },
      { key: "stocks", label: "Stocks", count: counts.stocks },
      { key: "etfs", label: "ETFs", count: counts.etfs },
      { key: "options", label: "Options", count: counts.options },
    ],
    trendingSector: options.includeTrending
      ? {
          name: "N/A",
          changeToday: "N/A",
          note: "Tradier search results do not include sector momentum snapshots.",
        }
      : {
          name: "N/A",
          changeToday: "N/A",
          note: "Trending sector is disabled for this request.",
        },
    results: limited,
  };
}
