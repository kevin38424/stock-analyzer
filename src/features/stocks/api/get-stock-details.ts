import type { RangeOption, StockDetailsResponse } from "@/features/stocks/types/stock-details";
import { fetchJson } from "@/lib/http/fetch-json";

export type GetStockDetailsParams = {
  ticker: string;
  range?: RangeOption;
};

export async function getStockDetails(params: GetStockDetailsParams): Promise<StockDetailsResponse> {
  const searchParams = new URLSearchParams({
    range: params.range ?? "1M",
  });

  return fetchJson<StockDetailsResponse>(
    `/api/stocks/${encodeURIComponent(params.ticker.toUpperCase())}/details?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}
