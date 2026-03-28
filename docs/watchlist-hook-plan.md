# Watchlist Hook Plan (Home Pattern + Supabase First)

## Goal
Set up Watchlist data loading using the same layering as Home:

1. Feature API client (`getWatchlistPage`)
2. Feature hook (`useWatchlistPage`)
3. Route handler validation and request-context user resolution
4. Server service (`fetchWatchlistPageData`)
5. Supabase-backed live getter with mock fallback

## Pattern Match With Home

Home:
- `useHomeDashboard` -> `getHomeDashboard` -> `/api/home` -> `getHomeDashboardDataLive`

Watchlist:
- `useWatchlistPage` -> `getWatchlistPage` -> `/api/watchlist` -> `fetchWatchlistPageData` -> `getWatchlistPageData`

## Added In This Pass
- API client: `src/features/watchlist/api/get-watchlist-page.ts`
- Mutation API client: `src/features/watchlist/api/manage-watchlist.ts`
- Hook: `src/features/watchlist/hooks/useWatchlistPage.ts`
- Mutation hooks:
  - `useCreateWatchlistItem`
  - `usePatchWatchlistItem`
  - `useDeleteWatchlistItem`
- Live event seam: `src/features/watchlist/live/watchlist-live-events.ts`
- UI wiring: `src/features/watchlist/components/WatchlistPage.tsx`
- View-state hook: `src/features/watchlist/hooks/useWatchlistViewState.ts`
- URL query normalizer: `src/features/watchlist/hooks/watchlistViewQuery.ts`
- Pagination hook: `src/features/watchlist/hooks/useWatchlistPagination.ts`
- Export hook: `src/features/watchlist/hooks/useWatchlistExport.ts`
- Realtime mock hook (Tradier prep): `src/features/watchlist/hooks/useWatchlistRealtimeMock.ts`
- Tests:
  - `src/features/watchlist/api/__tests__/get-watchlist-page.test.ts`
  - `src/features/watchlist/hooks/__tests__/useWatchlistPage.test.tsx`
  - updated `src/features/watchlist/components/__tests__/WatchlistComponents.test.tsx`
  - `src/features/watchlist/hooks/__tests__/useWatchlistViewState.test.tsx`
  - `src/features/watchlist/hooks/__tests__/useWatchlistPagination.test.tsx`
  - `src/features/watchlist/hooks/__tests__/useWatchlistExport.test.tsx`
  - `src/features/watchlist/hooks/__tests__/useWatchlistRealtimeMock.test.tsx`

## Query Contract
Endpoint:
- `GET /api/watchlist?segment=...&sortBy=...&userId=...`

Hook options:
- `userId?: string | null`
- `segment?: all_holdings | tech_growth | dividends | speculative`
- `sortBy?: score_desc | score_asc | delta_desc | delta_asc | price_desc | price_asc`
- `enabled?: boolean`
- `refetchInterval?: number` (default 15000ms)

React Query key:
- `["watchlist-page", { userId, segment, sortBy }]`

## Why This Is Tradier-Ready
Tradier websocket ingestion updates quote tables in Supabase. Watchlist already reads through the server live getter and quote freshness sync, so UI contracts stay stable.

Client-side seam:
- Hook listens for `market:quotes-updated` browser events and invalidates `["watchlist-page"]`.
- You can dispatch these events from websocket handlers via `emitMarketQuotesUpdated(...)`.

Phase-in plan:
1. Keep `useWatchlistPage` polling (15s default).
2. Start Tradier stream worker to keep quote rows fresh.
3. Optionally reduce polling or add websocket-driven query invalidation later.
4. Keep page component/API unchanged.

## Remaining Hooks (Optional Next)
- `useWatchlistActionsMenu`:
  - Purpose: row-level menu state and command execution (`move segment`, `remove`, `open details`).
  - Mock strategy: local command registry + fake resolver before wiring to mutations.
- `useWatchlistSortMenu`:
  - Purpose: accessible open/close + keyboard selection behavior for sort dropdown.
  - Mock strategy: static option list + analytics callback stub.
- `useWatchlistRealtimeTradier`:
  - Purpose: real websocket session management via server-issued session id.
  - Mock strategy: keep `useWatchlistRealtimeMock` enabled by env flag until account activation.
