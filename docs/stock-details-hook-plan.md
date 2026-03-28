# Stock Details Hook Plan (Home Pattern + Supabase First)

## Goal
Set up Stock Details data loading with the same pattern used by Home Dashboard:

1. Client hook (`useQuery`)
2. Feature API fetch helper (`fetchJson`)
3. Route handler in `app/api`
4. Server data service (`*-data-live.ts`)
5. Supabase reads with mock fallback

This lets us ship now with Supabase snapshots and later add Tradier websocket updates without breaking UI contracts.

## Pattern Match With Home

Home pattern today:
- `useHomeDashboard` -> `getHomeDashboard` -> `/api/home` -> `getHomeDashboardDataLive`

Stock details pattern implemented:
- `useStockDetails` -> `getStockDetails` -> `/api/stocks/[ticker]/details` -> `getStockDetailsDataLive`

## Files Added/Updated

Added:
- `src/features/stocks/hooks/useStockDetails.ts`
- `src/features/stocks/api/get-stock-details.ts`
- `src/server/stocks/get-stock-details-data-live.ts`
- `docs/stock-details-hook-plan.md`

Updated:
- `src/app/api/stocks/[ticker]/details/route.ts`
- `src/app/api/stocks/[ticker]/details/__tests__/route.test.ts`
- `src/features/stocks/index.ts`

## Current Query Contract

Endpoint:
- `GET /api/stocks/:ticker/details?range=1D|1W|1M|1Y|ALL`

Client hook:
- `useStockDetails({ ticker, range, enabled, refetchInterval })`

React Query key:
- `["stock-details", ticker, range]`

Default refresh:
- 15 seconds (same interval strategy as home)

## Supabase Data Sources Used

`getStockDetailsDataLive` currently composes:
- `companies`
- `v_company_quotes_latest`
- `v_stock_scores_latest`
- `stock_price_history_daily`
- `stock_technicals_daily`
- `stock_highlights_daily`
- `financial_metric_snapshots`
- `analyst_consensus_snapshots`
- `company_news`
- `insider_transactions`
- `v_top_stock_cards_latest` (peer seed)

Fallback:
- If Supabase env/data is unavailable, return `getMockStockDetails(...)`.

## Why This Is Tradier-Ready

Your websocket setup can update `stock_quotes_latest` continuously. Since stock details reads from `v_company_quotes_latest`, no hook/API contract changes are needed.

Planned flow after Tradier account setup:
1. Streaming worker keeps quote table fresh.
2. `useStockDetails` polls existing endpoint (short interval for market hours).
3. UI reflects live price delta from Supabase-backed route.

## Recommended Next Steps

1. Wire `StockDetailsPage` to `useStockDetails` and replace hardcoded blocks progressively.
2. Add stock-details skeleton/error states mirroring HomeDashboard behavior.
3. Add focused server tests for `getStockDetailsDataLive`:
   - full-data path
   - partial-data fallback defaults
   - no-company path
4. Add stale metadata per section in response (quotes/news/analyst timestamps).
5. After Tradier is active, reduce quote staleness by:
   - market hours polling every 5-10s
   - off-hours polling every 60s.
