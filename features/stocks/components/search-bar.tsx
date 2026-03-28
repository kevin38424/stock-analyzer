"use client";

import { useState, type FormEvent } from "react";
import { searchStocks } from "@/features/stocks/api/search-stocks";
import type { StockSearchResult } from "@/features/stocks/types/search";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const nextResults = await searchStocks(query);
      setResults(nextResults);
    } catch {
      setResults([]);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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
          disabled={isLoading}
          className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-950"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.ticker} className="rounded-xl border border-slate-800 px-4 py-3 text-sm">
            <div className="font-medium">
              {result.ticker} · {result.name}
            </div>
            <div className="text-slate-400">{result.sector}</div>
          </div>
        ))}
        {!isLoading && results.length === 0 && query.trim().length > 0 && !error ? (
          <p className="text-sm text-slate-400">No matches found.</p>
        ) : null}
      </div>
    </form>
  );
}
