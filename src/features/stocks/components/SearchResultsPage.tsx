"use client";

import { Heart, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { AppSidebar, AppTopbar, appLayoutClasses, appTypographyClasses, SearchResultsSkeleton } from "@/features/shared";
import { getEmptySearchResponse } from "@/lib/search/get-search-results";
import { useSearchResults } from "@/features/stocks/hooks/useSearchResults";
import type { SearchCategoryKey } from "@/features/stocks/types/search";

type SearchResultsPageProps = {
  initialQuery: string;
  initialCategory?: SearchCategoryKey;
  initialLimit?: number;
  initialIncludeTrending?: boolean;
};

function scoreBadgeClasses(score: number) {
  if (score >= 80) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  if (score >= 60) return "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
  if (score >= 40) return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return "border-rose-500/40 bg-rose-500/10 text-rose-300";
}

function buildSearchHref(params: {
  q: string;
  category: SearchCategoryKey;
  limit: number;
  includeTrending: boolean;
}): Route {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  searchParams.set("category", params.category);
  searchParams.set("limit", String(params.limit));
  if (!params.includeTrending) {
    searchParams.set("includeTrending", "false");
  }
  const queryString = searchParams.toString();
  return (queryString ? `/search?${queryString}` : "/search") as Route;
}

export function SearchResultsPage({
  initialQuery,
  initialCategory = "all",
  initialLimit = 25,
  initialIncludeTrending = true,
}: SearchResultsPageProps) {
  const normalizedQuery = initialQuery.trim();
  const selectedCategory = initialCategory;
  const selectedLimit = initialLimit;
  const includeTrending = initialIncludeTrending;
  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useSearchResults({
    q: normalizedQuery,
    category: selectedCategory,
    limit: selectedLimit,
    includeTrending,
  });
  const data = queryData ?? getEmptySearchResponse(normalizedQuery);
  const showSkeletonState = isLoading || (isFetching && data.results.length === 0);
  const showEmptyQueryState = normalizedQuery.length === 0;
  const showNoMatchesState = normalizedQuery.length > 0 && !isLoading && !isFetching && data.results.length === 0 && !isError;

  return (
    <main className={appLayoutClasses.page}>
      <div className={appLayoutClasses.shell}>
        <AppSidebar activePage="search" />

        <section className="flex min-h-screen flex-col">
          <AppTopbar
            searchValue={data.query}
            additionalSearchParams={{
              category: selectedCategory,
              limit: String(selectedLimit),
              includeTrending: String(includeTrending),
            }}
          />

          <div className={appLayoutClasses.content}>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <p className={appTypographyClasses.eyebrow}>SEARCH RESULTS</p>
                <h1 className={appTypographyClasses.pageTitle}>
                  {data.query ? `Results for "${data.query}"` : "Search Market Instruments"}
                </h1>
                <p className={appTypographyClasses.pageSubtitle}>
                  {data.total} matches found <span className="px-2 text-slate-500">•</span> Sorted by {data.sortedBy}
                </p>
                {isError ? <p className="mt-2 text-sm text-rose-300">Search failed. Please try again.</p> : null}

                {showEmptyQueryState ? (
                  <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
                    <div className="flex items-center gap-3">
                      <SearchIcon size={18} className="text-slate-400" />
                      <p>Use the top search bar to find stocks, ETFs, and options.</p>
                    </div>
                  </section>
                ) : null}

                <div className="mt-7 space-y-4">
                  {showSkeletonState ? <SearchResultsSkeleton rows={4} /> : null}
                  {data.results.map((result) => (
                    <article
                      key={result.ticker}
                      className="grid items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/75 px-5 py-4 sm:grid-cols-[1.8fr_0.8fr_0.7fr_26px]"
                    >
                      <Link
                        href={`/stocks/${encodeURIComponent(result.ticker)}`}
                        className="flex items-center gap-4"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#152447] text-sm font-semibold text-slate-200">
                          {result.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-semibold leading-tight text-slate-100">{result.name}</p>
                            <span className="rounded bg-slate-700/70 px-2 py-1 text-sm font-semibold text-slate-300">
                              {result.ticker}
                            </span>
                          </div>
                          <p className="text-base text-slate-400">
                            {result.sector} • {result.industry} • {result.exchange}
                          </p>
                        </div>
                      </Link>

                      <div>
                        <p className="text-xs tracking-wider text-slate-500">MARKET CAP</p>
                        <p className="app-data mt-1 text-2xl font-semibold text-slate-100">{result.marketCapLabel}</p>
                      </div>

                      <div>
                        <span
                          className={[
                            "app-data inline-flex rounded-full border px-3 py-1 text-sm font-semibold tracking-wider",
                            scoreBadgeClasses(result.score),
                          ].join(" ")}
                        >
                          {result.score} {result.sentiment}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="text-slate-400 transition hover:text-slate-200"
                        aria-label={`Favorite ${result.ticker}`}
                      >
                        <Heart size={20} />
                      </button>
                    </article>
                  ))}
                  {showNoMatchesState ? (
                    <article className="rounded-xl border border-slate-800 bg-slate-900/75 px-5 py-4 text-sm text-slate-300">
                      No matches found for this query.
                    </article>
                  ) : null}
                </div>
              </div>

              <aside className="space-y-4">
                <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                  <h2 className={appTypographyClasses.sectionTitle}>Trending Sector</h2>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-xl text-slate-100">{data.trendingSector.name}</p>
                    <p className="text-lg font-semibold text-emerald-300">{data.trendingSector.changeToday} Today</p>
                  </div>
                  <div className="mt-3 h-1 rounded-full bg-[#3a4b75]">
                    <div className="h-1 w-[82%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">{data.trendingSector.note}</p>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
                  <h2 className="text-xs tracking-[0.28em] text-slate-400">FILTER BY CATEGORY</h2>
                  <div className="mt-4 space-y-2">
                    {data.categories.map((bucket) => (
                      <Link
                        key={bucket.key}
                        href={buildSearchHref({
                          q: normalizedQuery,
                          category: bucket.key,
                          limit: selectedLimit,
                          includeTrending,
                        })}
                        className={[
                          "flex items-center justify-between rounded-lg px-3 py-2 text-base",
                          selectedCategory === bucket.key ? "bg-[#152447] text-slate-100" : "text-slate-300 hover:bg-slate-800/60",
                        ].join(" ")}
                      >
                        <span>{bucket.label}</span>
                        <span
                          className={
                            selectedCategory === bucket.key ? "rounded bg-blue-500/30 px-2 py-0.5 text-sm" : "text-base"
                          }
                        >
                          {bucket.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-[#050f2b] p-6">
                  <h2 className="text-xs tracking-[0.28em] text-slate-400">SCORE LEGEND</h2>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300 sm:text-base">
                    <li className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                      80 - 100: Bullish Sentiment
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                      40 - 79: Market Neutral
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                      0 - 39: Bearish Risk
                    </li>
                  </ul>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
