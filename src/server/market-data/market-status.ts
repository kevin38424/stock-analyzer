import { createTradierClientFromEnv } from "@/server/tradier/client";

export type MarketStatusSnapshot = {
  asOf: string;
  state: string | null;
  nextOpen: string | null;
  nextClose: string | null;
  tradingDayStatus: string | null;
  tradingDayDescription: string | null;
};

export async function getMarketStatusSnapshot(): Promise<MarketStatusSnapshot | null> {
  const client = createTradierClientFromEnv();
  if (!client) return null;

  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();

  const [clock, calendarDays] = await Promise.all([
    client.getMarketClock(),
    client.getMarketCalendar({ month, year }),
  ]);

  const todayIso = now.toISOString().slice(0, 10);
  const today = calendarDays.find((row) => row.date === todayIso) ?? null;

  return {
    asOf: clock.timestamp ?? new Date().toISOString(),
    state: clock.state,
    nextOpen: clock.nextOpen,
    nextClose: clock.nextClose,
    tradingDayStatus: today?.status ?? null,
    tradingDayDescription: today?.description ?? null,
  };
}
