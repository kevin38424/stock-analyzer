# Tradier Integration Scaffold (Endpoints 1-5)

This project now includes a unified Tradier client and server-side scaffolding for:

1. Search/lookup
2. Quotes snapshot/backfill
3. Streaming session bootstrap
4. History/time-sales price series
5. Market clock/calendar status

## Core module
- `src/server/tradier/client.ts`
  - `searchSecurities(query)`
  - `lookupSecurities(query)`
  - `getQuotes(...)`, `postQuotes(...)`, `getQuotesAuto(...)`
  - `getHistory(...)`
  - `getTimeSales(...)`
  - `getMarketClock()`
  - `getMarketCalendar(...)`
  - `createMarketSession()`

## Current integrations
- Quote sync path already uses the client via:
  - `src/server/market-data/providers/tradier-provider.ts`
- Streaming session creation now reuses the client:
  - `src/server/market-data/tradier-streaming.ts`
- Optional search fallback (disabled by default):
  - `src/server/search/get-search-results-tradier.ts`
  - gated by `TRADIER_SEARCH_FALLBACK_ENABLED=true`
- Optional market status route:
  - `GET /api/market/status`
  - implemented in `src/app/api/market/status/route.ts`
- Stock price-series adapter for future details chart integration:
  - `src/server/stocks/get-tradier-price-series.ts`

## Environment flags
- `TRADIER_API_TOKEN`
- `TRADIER_BASE_URL` (default `https://api.tradier.com/v1`)
- `TRADIER_QUOTES_POST_THRESHOLD` (default `40`)
- `TRADIER_SEARCH_FALLBACK_ENABLED` (default `false`)

## Why this structure
- Keeps HTTP route handlers thin.
- Centralizes Tradier wire-format handling in one place.
- Allows incremental adoption per feature without breaking current Supabase-first behavior.
