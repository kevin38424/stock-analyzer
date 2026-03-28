import { createTradierProvider } from "@/server/market-data/providers/tradier-provider";
import type { MarketDataProvider } from "@/server/market-data/types";

export function getMarketDataProvider(): MarketDataProvider | null {
  const configured = (process.env.MARKET_DATA_PROVIDER ?? "none").trim().toLowerCase();

  if (configured === "tradier") {
    const token = process.env.TRADIER_API_TOKEN;
    if (!token) return null;
    return createTradierProvider(token, process.env.TRADIER_BASE_URL);
  }

  return null;
}

export function getQuoteFreshnessSeconds(): number {
  const raw = Number(process.env.MARKET_DATA_MAX_QUOTE_AGE_SECONDS ?? "60");
  if (!Number.isFinite(raw) || raw <= 0) return 60;
  return Math.min(Math.trunc(raw), 300);
}
