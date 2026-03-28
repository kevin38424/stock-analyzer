"use client";

import { Bell, Moon, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

type AppTopbarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  searchRoute?: "/search";
  additionalSearchParams?: Record<string, string>;
  alertsCount?: number;
  onAlertsClick?: () => void;
  onThemeClick?: () => void;
  onProfileClick?: () => void;
};

const defaultSearchPlaceholder = "Search tickers, sectors, or analysts...";

export function AppTopbar({
  searchPlaceholder = defaultSearchPlaceholder,
  searchValue = "",
  searchRoute = "/search",
  additionalSearchParams,
  alertsCount = 0,
  onAlertsClick,
  onThemeClick,
  onProfileClick,
}: AppTopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchValue);

  useEffect(() => {
    setQuery(searchValue);
  }, [searchValue]);

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const searchParams = new URLSearchParams(additionalSearchParams);

    if (!trimmed) {
      const baseHref = searchParams.toString() ? `${searchRoute}?${searchParams.toString()}` : searchRoute;
      router.push(baseHref as Route);
      return;
    }

    searchParams.set("q", trimmed);
    router.push(`${searchRoute}?${searchParams.toString()}` as Route);
  }

  function handleAlertsClick() {
    if (onAlertsClick) {
      onAlertsClick();
      return;
    }

    router.push("/watchlist" as Route);
  }

  function handleThemeClick() {
    if (onThemeClick) {
      onThemeClick();
      return;
    }

    router.push("/settings?panel=display" as Route);
  }

  function handleProfileClick() {
    if (onProfileClick) {
      onProfileClick();
      return;
    }

    router.push("/settings" as Route);
  }

  return (
    <header className="border-b border-slate-800/70 bg-[#030c24] px-5 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <form className="relative w-full max-w-xl" onSubmit={onSearchSubmit}>
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-md border border-slate-800 bg-[#081534] pl-11 pr-4 text-sm text-slate-300 outline-none transition focus:border-slate-600"
          />
        </form>

        <div className="flex items-center gap-4 text-slate-300">
          <button
            type="button"
            className="relative rounded-md p-1.5 transition hover:bg-slate-800/70 hover:text-slate-100"
            onClick={handleAlertsClick}
            aria-label="Open alerts"
          >
            <Bell size={19} />
            {alertsCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {alertsCount > 9 ? "9+" : alertsCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 transition hover:bg-slate-800/70 hover:text-slate-100"
            onClick={handleThemeClick}
            aria-label="Toggle theme mode"
          >
            <Moon size={18} />
          </button>
          <div className="h-6 w-px bg-slate-700" />
          <button
            type="button"
            className="text-sm font-medium transition hover:text-slate-100"
            onClick={handleProfileClick}
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
}
