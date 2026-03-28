# Search Supabase Integration Plan

## Objective
Implement a homepage-style search data flow:
- `feature API client` + `client hook`
- thin `src/app/api/search/route.ts` adapter
- server-side live data service with mock fallback
- stable typed response contract for the search page

## Implemented Architecture
1. Client data layer
- `src/features/stocks/api/get-search-results.ts`
  - `getSearchResults(params)` builds URL query params and calls `/api/search`.
- `src/features/stocks/hooks/useSearchResults.ts`
  - React Query hook with stable keys:
    - `["search-results", { q, category, limit, includeTrending, userId }]`
  - Default behavior:
    - `category: "all"`
    - `limit: 25`
    - `includeTrending: true`
    - disabled when `q` is blank.

2. API route adapter
- `src/app/api/search/route.ts`
  - Parses query with Zod.
  - Resolves user context via `getRequestUserId(...)`.
  - Delegates to `getSearchResultsLive(...)`.
  - Returns typed payload with `ok(...)` and rejects invalid query params with `badRequest(...)`.

3. Server service
- `src/server/search/get-search-results-live.ts`
  - Uses Supabase read models when env is present.
  - Falls back to `src/lib/search/get-search-results.ts` on missing env, query failure, or exceptions.
  - Supports:
    - `category` filtering (`all`, `stocks`, `etfs`, `options`)
    - `limit`
    - optional trending sector data (`includeTrending`)

4. UI consumption
- `src/features/stocks/components/SearchResultsPage.tsx`
  - Converted to client component.
  - Uses `useSearchResults(...)` instead of directly reading mock data.
  - Shows loading, empty, and error states.

## Database Read Model
- Added `v_search_cards_latest` in `supabase/schema.sql`.
- View projects:
  - company identity (`ticker`, `company_name`, `sector`, `industry`, `exchange`)
  - derived `asset_type`
  - latest market cap (`coalesce(v_company_quotes_latest.market_cap, companies.market_cap)`)
  - latest score/recommendation (`v_stock_scores_latest`)

This keeps search read logic aligned with the canonical + derived model used elsewhere.

## Tradier Streaming Readiness
- Search currently reads from canonical DB projections, not direct provider payloads.
- Once your Tradier account is active, stream updates that write into canonical quote tables will automatically improve search freshness through the existing views.
