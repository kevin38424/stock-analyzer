import { TopStocksView } from "@/features/stocks";
import type { TopStocksViewInitialQuery } from "@/features/stocks/hooks/useTopStocksViewState";
import type { ValuationStyle } from "@/features/stocks/types/top-stocks";

function parseUuid(value: string | undefined): string | null {
  if (!value) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value) ? value : null;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function parseValuationStyle(value: string | undefined, fallback: ValuationStyle): ValuationStyle {
  if (value === "growth" || value === "value" || value === "income") {
    return value;
  }
  return fallback;
}

export default async function TopStocksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const initialQuery: TopStocksViewInitialQuery = {
    limit: parseNumber(params.limit, 50),
    offset: parseNumber(params.offset, 0),
    favoritesOnly: parseBoolean(params.favoritesOnly, false),
    minScore: parseNumber(params.minScore, 85),
    maxScore: parseNumber(params.maxScore, 100),
    sector: params.sector ?? "all",
    valuationStyle: parseValuationStyle(params.valuationStyle, "growth"),
  };
  const userId = parseUuid(params.userId);

  return <TopStocksView initialQuery={initialQuery} userId={userId} />;
}
