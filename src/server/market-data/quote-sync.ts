import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/server/supabase-server";
import { getMarketDataProvider, getQuoteFreshnessSeconds } from "@/server/market-data/provider-registry";
import type { LiveQuote } from "@/server/market-data/types";
import { logServerError } from "@/server/observability/log-server-error";

type StoredQuoteRow = {
  company_id: string;
  price: number;
  previous_close: number | null;
  change_percent: number | null;
  market_cap: number | null;
  volume: number | null;
  fetched_at: string;
  source_provider: string;
};

type CompanyRow = {
  id: string;
  ticker: string;
};

function normalizeTickers(tickers: string[]): string[] {
  return Array.from(
    new Set(
      tickers
        .map((ticker) => ticker.trim().toUpperCase())
        .filter((ticker) => ticker.length > 0),
    ),
  );
}

function isStale(fetchedAt: string | null | undefined, maxAgeSeconds: number): boolean {
  if (!fetchedAt) return true;
  const ms = Date.now() - new Date(fetchedAt).getTime();
  return !Number.isFinite(ms) || ms > maxAgeSeconds * 1000;
}

async function loadCompaniesByTicker(supabase: SupabaseClient, tickers: string[]): Promise<CompanyRow[]> {
  if (tickers.length === 0) return [];

  const { data, error } = await supabase.from("companies").select("id, ticker").in("ticker", tickers);

  if (error || !data) return [];
  return data as CompanyRow[];
}

async function loadLatestQuotesByCompanyId(
  supabase: SupabaseClient,
  companyIds: string[],
): Promise<Map<string, StoredQuoteRow>> {
  if (companyIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("stock_quotes_latest")
    .select("company_id, price, previous_close, change_percent, market_cap, volume, fetched_at, source_provider")
    .in("company_id", companyIds);

  if (error || !data) return new Map();

  return new Map((data as StoredQuoteRow[]).map((row) => [row.company_id, row]));
}

function toDbUpsertRows(
  quotes: LiveQuote[],
  companyByTicker: Map<string, CompanyRow>,
): Array<{
  company_id: string;
  price: number;
  previous_close: number | null;
  change_percent: number | null;
  market_cap: number | null;
  volume: number | null;
  source_provider: string;
  fetched_at: string;
}> {
  const rows: Array<{
    company_id: string;
    price: number;
    previous_close: number | null;
    change_percent: number | null;
    market_cap: number | null;
    volume: number | null;
    source_provider: string;
    fetched_at: string;
  }> = [];

  for (const quote of quotes) {
    const company = companyByTicker.get(quote.ticker.toUpperCase());
    if (!company) continue;

    rows.push({
      company_id: company.id,
      price: quote.price,
      previous_close: quote.previousClose,
      change_percent: quote.changePercent,
      market_cap: quote.marketCap,
      volume: quote.volume,
      source_provider: quote.sourceProvider,
      fetched_at: quote.fetchedAt,
    });
  }

  return rows;
}

export type QuoteSnapshot = {
  ticker: string;
  price: number;
  previousClose: number | null;
  changePercent: number | null;
  marketCap: number | null;
  volume: number | null;
  fetchedAt: string;
  sourceProvider: string;
};

function toQuoteSnapshot(ticker: string, row: StoredQuoteRow): QuoteSnapshot {
  return {
    ticker,
    price: Number(row.price),
    previousClose: row.previous_close === null ? null : Number(row.previous_close),
    changePercent: row.change_percent === null ? null : Number(row.change_percent),
    marketCap: row.market_cap === null ? null : Number(row.market_cap),
    volume: row.volume === null ? null : Number(row.volume),
    fetchedAt: row.fetched_at,
    sourceProvider: row.source_provider,
  };
}

async function startSyncRun(
  supabase: SupabaseClient,
  payload: { runKind: "on_demand" | "scheduled" | "stream"; provider: string; symbolCount: number },
): Promise<string | null> {
  const { data, error } = await supabase
    .from("market_data_sync_runs")
    .insert({
      run_kind: payload.runKind,
      provider: payload.provider,
      status: "started",
      symbol_count: payload.symbolCount,
      ingested_count: 0,
    })
    .select("id")
    .single();

  if (error || !data?.id) return null;
  return data.id;
}

async function finishSyncRun(
  supabase: SupabaseClient,
  runId: string,
  payload: { status: "succeeded" | "partial" | "failed"; ingestedCount: number; errorMessage?: string },
): Promise<void> {
  await supabase
    .from("market_data_sync_runs")
    .update({
      status: payload.status,
      ingested_count: payload.ingestedCount,
      error_message: payload.errorMessage ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);
}

export async function ensureFreshQuotesForTickers(
  tickers: string[],
  options?: {
    maxAgeSeconds?: number;
    supabase?: SupabaseClient;
    runKind?: "on_demand" | "scheduled" | "stream";
  },
): Promise<Map<string, QuoteSnapshot>> {
  const normalizedTickers = normalizeTickers(tickers);
  if (normalizedTickers.length === 0 || !hasServerSupabaseEnv()) return new Map();

  try {
    const maxAgeSeconds = options?.maxAgeSeconds ?? getQuoteFreshnessSeconds();
    const provider = getMarketDataProvider();
    const supabase = options?.supabase ?? createServerSupabaseClient();
    const runKind = options?.runKind ?? "on_demand";

    const companies = await loadCompaniesByTicker(supabase, normalizedTickers);
    const companyByTicker = new Map(companies.map((company) => [company.ticker.toUpperCase(), company]));

    if (companyByTicker.size === 0) {
      return new Map();
    }

    const companyIds = companies.map((company) => company.id);
    const existingByCompanyId = await loadLatestQuotesByCompanyId(supabase, companyIds);

    const staleTickers: string[] = [];
    for (const [ticker, company] of companyByTicker) {
      const existing = existingByCompanyId.get(company.id);
      if (!existing || isStale(existing.fetched_at, maxAgeSeconds)) {
        staleTickers.push(ticker);
      }
    }

    const runId =
      provider && staleTickers.length > 0
        ? await startSyncRun(supabase, {
            runKind,
            provider: provider.name,
            symbolCount: staleTickers.length,
          })
        : null;

    if (provider && staleTickers.length > 0) {
      try {
        const freshQuotes = await provider.fetchQuotes(staleTickers);
        const upsertRows = toDbUpsertRows(freshQuotes, companyByTicker);

        if (upsertRows.length > 0) {
          await supabase.from("stock_quotes_latest").upsert(upsertRows, { onConflict: "company_id" });
        }

        if (runId) {
          const status = upsertRows.length === staleTickers.length ? "succeeded" : "partial";
          await finishSyncRun(supabase, runId, { status, ingestedCount: upsertRows.length });
        }
      } catch (error) {
        logServerError("marketData.ensureFreshQuotesForTickers.providerFetch", error, {
          runKind,
          staleTickers,
        });
        // Provider failure should not fail API reads; stale DB quotes remain a safe fallback.
        if (runId) {
          await finishSyncRun(supabase, runId, {
            status: "failed",
            ingestedCount: 0,
            errorMessage: "provider_fetch_failed",
          });
        }
      }
    }

    const finalQuotes = await loadLatestQuotesByCompanyId(supabase, companyIds);
    const result = new Map<string, QuoteSnapshot>();

    for (const [ticker, company] of companyByTicker) {
      const row = finalQuotes.get(company.id);
      if (!row) continue;
      result.set(ticker, toQuoteSnapshot(ticker, row));
    }

    return result;
  } catch (error) {
    logServerError("marketData.ensureFreshQuotesForTickers", error, {
      tickers: normalizedTickers,
      maxAgeSeconds: options?.maxAgeSeconds,
      runKind: options?.runKind,
    });
    return new Map();
  }
}
