import { WatchlistPage } from "@/features/watchlist";
import { normalizeWatchlistViewQuery, type WatchlistViewQuery } from "@/features/watchlist/hooks/watchlistViewQuery";

type WatchlistRoutePageProps = {
  searchParams?: Promise<{
    segment?: string;
    sortBy?: string;
  }>;
};

export default async function WatchlistRoutePage({ searchParams }: WatchlistRoutePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const initialQuery: WatchlistViewQuery = normalizeWatchlistViewQuery({
    segment: params?.segment,
    sortBy: params?.sortBy,
  });

  return (
    <WatchlistPage initialQuery={initialQuery} />
  );
}
