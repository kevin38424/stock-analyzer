import type { LiveQuote, MarketDataProvider } from "@/server/market-data/types";
import { createTradierClient } from "@/server/tradier/client";

export function createTradierProvider(token: string, baseUrl?: string): MarketDataProvider {
  const client = createTradierClient({ token, baseUrl });
  const thresholdRaw = Number(process.env.TRADIER_QUOTES_POST_THRESHOLD ?? 40);
  const postThreshold = Number.isFinite(thresholdRaw) && thresholdRaw > 0 ? Math.trunc(thresholdRaw) : 40;

  return {
    name: "tradier",
    async fetchQuotes(tickers: string[]) {
      const snapshots = await client.getQuotesAuto(tickers, {
        greeks: false,
        postThreshold,
      });

      return snapshots.map<LiveQuote>((snapshot) => ({
        ticker: snapshot.symbol,
        price: snapshot.price,
        previousClose: snapshot.previousClose,
        changePercent: snapshot.changePercent,
        marketCap: snapshot.marketCap,
        volume: snapshot.volume == null ? null : Math.trunc(snapshot.volume),
        fetchedAt: snapshot.asOf,
        sourceProvider: "tradier",
      }));
    },
  };
}
