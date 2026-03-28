import type { TopStocksPagePayload, TopStocksRow } from "@/features/stocks/types/top-stocks";
import type { WatchlistRecommendation } from "@/features/watchlist/types/watchlist";
import type { HomeDashboardResponse, HomeWatchlistRow } from "@/features/home/types/dashboard";

function toNormalizedRecommendation(input: string | null | undefined): string {
  return (input ?? "").trim().toUpperCase();
}

export function toTopStocksRowRecommendation(
  input: string | null | undefined,
): TopStocksRow["recommendation"] {
  const normalized = toNormalizedRecommendation(input);
  if (normalized === "BUY" || normalized === "HOLD" || normalized === "WATCH" || normalized === "AVOID") {
    return normalized;
  }
  if (normalized === "STRONG BUY") {
    return "BUY";
  }
  return "WATCH";
}

export function toTopStocksFeaturedRecommendation(
  input: string | null | undefined,
): TopStocksPagePayload["featured"]["recommendation"] {
  const normalized = toNormalizedRecommendation(input);
  if (
    normalized === "STRONG BUY" ||
    normalized === "BUY" ||
    normalized === "HOLD" ||
    normalized === "WATCH" ||
    normalized === "AVOID"
  ) {
    return normalized;
  }
  return "WATCH";
}

export function toWatchlistRecommendation(input: string | null | undefined): WatchlistRecommendation {
  const normalized = toNormalizedRecommendation(input);
  if (
    normalized === "STRONG BUY" ||
    normalized === "BUY" ||
    normalized === "HOLD" ||
    normalized === "WATCH" ||
    normalized === "AVOID"
  ) {
    return normalized;
  }
  return "WATCH";
}

export function toHomeTopStockRecommendation(
  input: string | null | undefined,
): HomeDashboardResponse["topStocks"][number]["recommendation"] {
  const normalized = toNormalizedRecommendation(input);
  if (normalized === "STRONG BUY") return "Strong Buy";
  if (normalized === "BUY") return "Buy";
  if (normalized === "WATCH") return "Watch";
  return "Avoid";
}

export function toHomeWatchlistSignal(
  input: string | null | undefined,
): HomeWatchlistRow["signal"] {
  const normalized = toNormalizedRecommendation(input);
  if (normalized === "STRONG BUY") return "Strong Buy";
  if (normalized === "BUY") return "Buy";
  if (normalized === "WATCH") return "Watch";
  return "Hold";
}

export function toStockDetailsRatingLabel(
  input: string | null | undefined,
): "Strong Buy" | "Buy" | "Watch" | "Avoid" {
  const normalized = toNormalizedRecommendation(input);
  if (normalized === "STRONG BUY") return "Strong Buy";
  if (normalized === "BUY") return "Buy";
  if (normalized === "WATCH" || normalized === "HOLD") return "Watch";
  return "Avoid";
}

export function toStockDetailsAnalystRecommendation(
  input: string | null | undefined,
): "Buy" | "Hold" | "Sell" {
  const normalized = toNormalizedRecommendation(input);
  if (normalized === "BUY" || normalized === "STRONG BUY") return "Buy";
  if (normalized === "SELL" || normalized === "AVOID") return "Sell";
  return "Hold";
}

export function toStockDetailsPeerRating(
  input: string | null | undefined,
): "STRONG BUY" | "BUY" | "WATCH" | "AVOID" {
  const normalized = toNormalizedRecommendation(input);
  if (normalized === "STRONG BUY") return "STRONG BUY";
  if (normalized === "BUY") return "BUY";
  if (normalized === "WATCH" || normalized === "HOLD") return "WATCH";
  return "AVOID";
}
