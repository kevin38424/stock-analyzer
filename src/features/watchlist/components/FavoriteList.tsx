"use client";

import { useFavoriteList } from "@/features/watchlist/hooks/useFavoriteList";

export function FavoriteList() {
  const { favorites } = useFavoriteList({ limit: 2 });

  return (
    <aside className="card">
      <h2 className="text-xl font-semibold">Favorites</h2>
      <p className="mt-1 text-sm text-slate-400">Saved stocks to monitor.</p>
      <div className="mt-4 space-y-3">
        {favorites.map((item) => (
          <div key={item.ticker} className="rounded-xl border border-slate-800 px-4 py-3">
            <div className="font-medium">{item.ticker}</div>
            <div className="text-sm text-slate-400">Score {item.score}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
