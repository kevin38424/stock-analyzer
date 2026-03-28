import { appLayoutClasses } from "@/features/shared/styles/layout";

type SkeletonBlockProps = {
  className?: string;
};

function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return <div className={`app-skeleton ${className}`.trim()} aria-hidden="true" />;
}

function SkeletonLabel({ text = "Loading data..." }: { text?: string }) {
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {text}
    </p>
  );
}

export function HomeDashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <SkeletonLabel text="Loading market intelligence..." />
      <section className="relative overflow-hidden rounded-xl bg-[#0a1f4a] p-6 sm:p-8">
        <div className="max-w-2xl">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="mt-4 h-12 w-[36rem] max-w-full" />
          <SkeletonBlock className="mt-2 h-12 w-[30rem] max-w-full" />
          <SkeletonBlock className="mt-5 h-5 w-[38rem] max-w-full" />
          <div className="mt-7 flex flex-wrap gap-3">
            <SkeletonBlock className="h-11 w-40 rounded-md" />
            <SkeletonBlock className="h-11 w-44 rounded-md" />
          </div>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={`metric-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-8 w-16" />
            <SkeletonBlock className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <SkeletonBlock className="h-5 w-44" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`top-${index}`} className="grid gap-3 rounded-lg border border-slate-800/80 p-3 sm:grid-cols-[64px_1fr_92px]">
                <SkeletonBlock className="h-10 w-10 rounded-md" />
                <div>
                  <SkeletonBlock className="h-4 w-40" />
                  <SkeletonBlock className="mt-2 h-3 w-24" />
                </div>
                <SkeletonBlock className="h-8 w-full" />
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <SkeletonBlock className="h-5 w-36" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`watch-${index}`} className="grid gap-3 rounded-lg border border-slate-800/80 p-3 sm:grid-cols-[56px_1fr_96px]">
                <SkeletonBlock className="h-10 w-10 rounded-md" />
                <div>
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="mt-2 h-3 w-24" />
                </div>
                <SkeletonBlock className="h-8 w-full" />
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <SkeletonBlock className="h-5 w-56" />
        <SkeletonBlock className="mt-4 h-20 w-full rounded-lg" />
      </section>
    </div>
  );
}

export function SearchResultsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      <SkeletonLabel text="Searching market data..." />
      {Array.from({ length: rows }).map((_, index) => (
        <article
          key={`search-row-${index}`}
          className="grid items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/75 px-5 py-4 sm:grid-cols-[1.8fr_0.8fr_0.7fr_26px]"
        >
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-12 w-12 rounded-md" />
            <div>
              <SkeletonBlock className="h-6 w-48" />
              <SkeletonBlock className="mt-2 h-4 w-64 max-w-full" />
            </div>
          </div>
          <SkeletonBlock className="h-6 w-24" />
          <SkeletonBlock className="h-7 w-24 rounded-full" />
          <SkeletonBlock className="h-5 w-5 rounded-full" />
        </article>
      ))}
    </div>
  );
}

export function TopStocksSkeleton({ rowCount = 8 }: { rowCount?: number }) {
  return (
    <div className="space-y-5" aria-busy="true">
      <SkeletonLabel text="Loading top stock rankings..." />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SkeletonBlock className="h-10 w-64 max-w-full" />
          <SkeletonBlock className="mt-3 h-5 w-[42rem] max-w-full" />
        </div>
        <SkeletonBlock className="mt-2 h-12 w-52 rounded-md" />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[340px_1fr]">
        <div className="space-y-5">
      <section className={appLayoutClasses.panel}>
        <SkeletonBlock className="h-5 w-40" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={`filter-${index}`} className="h-10 w-full rounded-lg" />
          ))}
          <SkeletonBlock className="mt-4 h-11 w-full rounded-md" />
        </div>
      </section>
        </div>
        <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/75 p-6">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-lg bg-[#152447] p-6">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-4 h-16 w-24" />
            <SkeletonBlock className="mt-4 h-8 w-28 rounded-full" />
          </div>
          <div className="space-y-3">
            <SkeletonBlock className="h-9 w-64 max-w-full" />
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-20 w-full rounded-md" />
          </div>
        </div>
      </section>
      <section className="space-y-3">
        {Array.from({ length: rowCount }).map((_, index) => (
          <article key={`rank-row-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/75 px-4 py-4 sm:px-6">
            <div className="grid items-center gap-3 sm:grid-cols-[48px_56px_1fr_120px]">
              <SkeletonBlock className="h-6 w-10" />
              <SkeletonBlock className="h-12 w-12 rounded-sm" />
              <div>
                <SkeletonBlock className="h-5 w-48 max-w-full" />
                <SkeletonBlock className="mt-2 h-4 w-32" />
              </div>
              <SkeletonBlock className="h-10 w-full" />
            </div>
          </article>
        ))}
      </section>
        </div>
      </div>
    </div>
  );
}

export function WatchlistSkeleton({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <div className="space-y-6" aria-busy="true">
      <SkeletonLabel text="Loading watchlist..." />
      <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`kpi-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-8 w-20" />
          </article>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="space-y-3">
          {Array.from({ length: rowCount }).map((_, index) => (
            <div key={`watch-row-${index}`} className="grid gap-4 rounded-xl border border-slate-800/70 p-4 md:grid-cols-[2fr_1fr_1.2fr_1fr_1fr_1.6fr]">
              <div>
                <SkeletonBlock className="h-6 w-44 max-w-full" />
                <SkeletonBlock className="mt-2 h-4 w-20" />
              </div>
              <SkeletonBlock className="h-7 w-24 rounded-md" />
              <SkeletonBlock className="h-7 w-36" />
              <SkeletonBlock className="h-7 w-28" />
              <SkeletonBlock className="h-7 w-24 rounded-full" />
              <SkeletonBlock className="h-5 w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WatchlistTableSkeleton({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      <SkeletonLabel text="Loading watchlist rows..." />
      {Array.from({ length: rowCount }).map((_, index) => (
        <div key={`watch-table-row-${index}`} className="grid gap-4 rounded-xl border border-slate-800/70 p-4 md:grid-cols-[2fr_1fr_1.2fr_1fr_1fr_1.6fr]">
          <div>
            <SkeletonBlock className="h-6 w-44 max-w-full" />
            <SkeletonBlock className="mt-2 h-4 w-20" />
          </div>
          <SkeletonBlock className="h-7 w-24 rounded-md" />
          <SkeletonBlock className="h-7 w-36" />
          <SkeletonBlock className="h-7 w-28" />
          <SkeletonBlock className="h-7 w-24 rounded-full" />
          <SkeletonBlock className="h-5 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]" aria-busy="true">
      <SkeletonLabel text="Loading account settings..." />
      <div className="space-y-6">
        <div>
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-3 h-10 w-72 max-w-full" />
          <SkeletonBlock className="mt-3 h-5 w-[28rem] max-w-full" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <section key={`settings-section-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/75 p-6">
            <SkeletonBlock className="h-7 w-52 max-w-full" />
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-16 w-full rounded-lg" />
              <SkeletonBlock className="h-16 w-full rounded-lg" />
              <SkeletonBlock className="h-16 w-full rounded-lg" />
            </div>
          </section>
        ))}
      </div>
      <div className="space-y-4">
        <SkeletonBlock className="h-48 w-full rounded-xl" />
        <SkeletonBlock className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function StockDetailsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <SkeletonLabel text="Loading stock details..." />
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <SkeletonBlock className="h-9 w-72 max-w-full" />
          <SkeletonBlock className="mt-3 h-5 w-96 max-w-full" />
          <SkeletonBlock className="mt-6 h-16 w-52" />
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="mt-4 h-12 w-24" />
          <SkeletonBlock className="mt-4 h-8 w-24 rounded-full" />
        </article>
      </section>
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="mt-4 h-[260px] w-full rounded-lg" />
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <SkeletonBlock className="h-40 w-full rounded-xl" />
        <SkeletonBlock className="h-40 w-full rounded-xl" />
        <SkeletonBlock className="h-40 w-full rounded-xl" />
      </section>
    </div>
  );
}
