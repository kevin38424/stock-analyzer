"use client";

import { useState, type FormEvent } from "react";
import { useStockSearch } from "@/features/stocks/hooks/useStockSearch";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const {
    data,
    isFetching,
    isError,
    refetch,
  } = useStockSearch({ query: submittedQuery });

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSubmittedQuery("");
      return;
    }

    if (trimmedQuery === submittedQuery) {
      await refetch();
      return;
    }

    setSubmittedQuery(trimmedQuery);
  }

  const results = data?.results ?? [];
  const showNoMatches = !isFetching && submittedQuery.length > 0 && results.length === 0 && !isError;

  return (
    <form className="space-y-4" onSubmit={onSearch}>
      <div className="flex gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ticker or company name"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
          aria-label="Search ticker or company name"
        />
        <button
          type="submit"
          disabled={isFetching}
          className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-950"
        >
          {isFetching ? "Searching..." : "Search"}
        </button>
      </div>
      {isError ? <p className="text-sm text-red-400">Search failed. Please try again.</p> : null}
      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.ticker} className="rounded-xl border border-slate-800 px-4 py-3 text-sm">
            <div className="font-medium">
              {result.ticker} · {result.name}
            </div>
            <div className="text-slate-400">{result.sector}</div>
          </div>
        ))}
        {showNoMatches ? <p className="text-sm text-slate-400">No matches found.</p> : null}
      </div>
    </form>
  );
}
