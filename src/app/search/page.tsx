import { SearchResultsPage } from "@/features/stocks";
import type { SearchCategoryKey } from "@/features/stocks/types/search";

const allowedCategories = new Set<SearchCategoryKey>(["all", "stocks", "etfs", "options"]);

function parseCategory(value: string | undefined): SearchCategoryKey {
  if (!value) return "all";
  return allowedCategories.has(value as SearchCategoryKey) ? (value as SearchCategoryKey) : "all";
}

function parseLimit(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 25;
  return Math.min(parsed, 100);
}

function parseIncludeTrending(value: string | undefined): boolean {
  if (!value) return true;
  return value.toLowerCase() !== "false";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; limit?: string; includeTrending?: string }>;
}) {
  const params = await searchParams;
  const rawQuery = params.q ?? "";
  let decodedQuery = rawQuery;
  try {
    decodedQuery = decodeURIComponent(rawQuery);
  } catch {
    decodedQuery = rawQuery;
  }

  return (
    <SearchResultsPage
      initialQuery={decodedQuery}
      initialCategory={parseCategory(params.category)}
      initialLimit={parseLimit(params.limit)}
      initialIncludeTrending={parseIncludeTrending(params.includeTrending)}
    />
  );
}
