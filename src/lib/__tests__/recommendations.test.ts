import { describe, expect, it } from "vitest";
import {
  toHomeTopStockRecommendation,
  toHomeWatchlistSignal,
  toStockDetailsAnalystRecommendation,
  toStockDetailsPeerRating,
  toStockDetailsRatingLabel,
  toTopStocksFeaturedRecommendation,
  toTopStocksRowRecommendation,
  toWatchlistRecommendation,
} from "@/server/recommendations";

describe("recommendations", () => {
  it("maps top-stock row recommendation values", () => {
    expect(toTopStocksRowRecommendation("buy")).toBe("BUY");
    expect(toTopStocksRowRecommendation("strong buy")).toBe("BUY");
    expect(toTopStocksRowRecommendation(" ??? ")).toBe("WATCH");
  });

  it("maps featured/watchlist recommendations", () => {
    expect(toTopStocksFeaturedRecommendation("strong buy")).toBe("STRONG BUY");
    expect(toTopStocksFeaturedRecommendation(null)).toBe("WATCH");
    expect(toWatchlistRecommendation("hold")).toBe("HOLD");
    expect(toWatchlistRecommendation(undefined)).toBe("WATCH");
  });

  it("maps home-specific wording", () => {
    expect(toHomeTopStockRecommendation("STRONG BUY")).toBe("Strong Buy");
    expect(toHomeTopStockRecommendation("BUY")).toBe("Buy");
    expect(toHomeTopStockRecommendation("WATCH")).toBe("Watch");
    expect(toHomeTopStockRecommendation("HOLD")).toBe("Avoid");

    expect(toHomeWatchlistSignal("STRONG BUY")).toBe("Strong Buy");
    expect(toHomeWatchlistSignal("BUY")).toBe("Buy");
    expect(toHomeWatchlistSignal("WATCH")).toBe("Watch");
    expect(toHomeWatchlistSignal("HOLD")).toBe("Hold");
  });

  it("maps stock-details specific wording", () => {
    expect(toStockDetailsRatingLabel("STRONG BUY")).toBe("Strong Buy");
    expect(toStockDetailsRatingLabel("HOLD")).toBe("Watch");
    expect(toStockDetailsRatingLabel("???")).toBe("Avoid");

    expect(toStockDetailsAnalystRecommendation("strong buy")).toBe("Buy");
    expect(toStockDetailsAnalystRecommendation("avoid")).toBe("Sell");
    expect(toStockDetailsAnalystRecommendation("watch")).toBe("Hold");

    expect(toStockDetailsPeerRating("strong buy")).toBe("STRONG BUY");
    expect(toStockDetailsPeerRating("hold")).toBe("WATCH");
    expect(toStockDetailsPeerRating("sell")).toBe("AVOID");
  });
});
