export const MARKET_QUOTES_UPDATED_EVENT = "market:quotes-updated";

export type MarketQuotesUpdatedPayload = {
  tickers: string[];
  source?: "tradier" | "mock" | "manual";
};

export function emitMarketQuotesUpdated(payload: MarketQuotesUpdatedPayload): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<MarketQuotesUpdatedPayload>(MARKET_QUOTES_UPDATED_EVENT, {
      detail: {
        tickers: payload.tickers.map((ticker) => ticker.toUpperCase()),
        source: payload.source ?? "manual",
      },
    }),
  );
}
