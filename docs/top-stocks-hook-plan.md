# Top Stocks Hook Plan (Home Pattern)

## Objective
Set up Top Stocks data-fetching with the same layering used by Home:
- feature API client
- feature hook (`react-query`)
- route handler validation
- server data service (Supabase + fallback)

## Current Status
Already in place:
- Route: `src/app/api/top-stocks/route.ts`
- Server service: `src/server/top-stocks/get-top-stocks-page-data.ts`
- Types: `src/features/stocks/types/top-stocks.ts`

Added in this pass:
- API client: `src/features/stocks/api/get-top-stocks-page.ts`
- Hook: `src/features/stocks/hooks/useTopStocksPage.ts`

## Data Flow
UI (`TopStocksView`) -> `useTopStocksPage` -> `getTopStocksPage` -> `/api/top-stocks` -> `getTopStocksPageData` -> Supabase view + tables.

## Why this aligns with Home
- Same query-key strategy and polling defaults.
- Same split between API client and UI hook.
- Same route-input validation with zod and request-context user resolution.
- Same server-side fallback behavior when data source is unavailable.

## Tradier Streaming Phase-In
1. Keep Top Stocks hook polling every 15s (already set).
2. Add quote freshness service that updates `stock_quotes_latest` (already partially present).
3. Add Tradier websocket consumer to write latest quotes by subscribed symbols.
4. Keep UI unchanged: hook still reads `/api/top-stocks`; data freshness improves automatically.

## Next Integration Task
Wire `TopStocksView` to consume `useTopStocksPage` and replace static row/card data with API payload fields incrementally:
1. featured card
2. ranking rows
3. filter controls -> query params
