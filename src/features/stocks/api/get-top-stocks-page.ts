import type { TopStocksPagePayload, TopStocksQuery } from "@/features/stocks/types/top-stocks";
import { fetchJson } from "@/lib/http/fetch-json";

export type GetTopStocksPageParams = Partial<Omit<TopStocksQuery, "userId">> & {
  userId?: string | null;
};

const DEFAULT_QUERY: Omit<TopStocksQuery, "userId"> = {
  limit: 25,
  offset: 0,
  favoritesOnly: false,
  minScore: 0,
  maxScore: 100,
  sector: "all",
  valuationStyle: "growth",
};

export async function getTopStocksPage(
  params: GetTopStocksPageParams = {},
): Promise<TopStocksPagePayload> {
  const query = {
    ...DEFAULT_QUERY,
    ...params,
  };

  const searchParams = new URLSearchParams({
    limit: String(query.limit),
    offset: String(query.offset),
    favoritesOnly: String(query.favoritesOnly),
    minScore: String(query.minScore),
    maxScore: String(query.maxScore),
    sector: query.sector,
    valuationStyle: query.valuationStyle,
  });

  if (params.userId) {
    searchParams.set("userId", params.userId);
  }

  return fetchJson<TopStocksPagePayload>(`/api/top-stocks?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
}
