import type { PricePoint, RangeOption } from "@/features/stocks/types/stock-details";
import { createTradierClientFromEnv } from "@/server/tradier/client";

export type TradierPriceSeries = {
  source: "history" | "timesales";
  points: PricePoint[];
};

function toStartDate(range: RangeOption, now: Date): string {
  const start = new Date(now);
  if (range === "1D") start.setUTCDate(start.getUTCDate() - 1);
  else if (range === "1W") start.setUTCDate(start.getUTCDate() - 7);
  else if (range === "1M") start.setUTCMonth(start.getUTCMonth() - 1);
  else if (range === "1Y") start.setUTCFullYear(start.getUTCFullYear() - 1);
  else start.setUTCFullYear(start.getUTCFullYear() - 3);
  return start.toISOString().slice(0, 10);
}

export async function getTradierPriceSeries(input: {
  ticker: string;
  range: RangeOption;
}): Promise<TradierPriceSeries | null> {
  const client = createTradierClientFromEnv();
  if (!client) return null;

  const now = new Date();
  const symbol = input.ticker.trim().toUpperCase();
  if (!symbol) return null;

  if (input.range === "1D") {
    const start = toStartDate(input.range, now);
    const end = now.toISOString().slice(0, 10);
    const points = await client.getTimeSales({
      symbol,
      interval: "5min",
      start,
      end,
      sessionFilter: "all",
    });

    return {
      source: "timesales",
      points: points
        .filter((row) => row.price != null)
        .map((row) => ({
          date: row.time,
          price: Number(row.price),
          sma200: Number(row.price),
        })),
    };
  }

  const start = toStartDate(input.range, now);
  const end = now.toISOString().slice(0, 10);
  const bars = await client.getHistory({
    symbol,
    interval: "daily",
    start,
    end,
  });

  return {
    source: "history",
    points: bars
      .filter((bar) => bar.close != null)
      .map((bar) => ({
        date: bar.date,
        price: Number(bar.close),
        sma200: Number(bar.close),
      })),
  };
}
