# Stock Details UX Spec

## Scope
This spec defines interactive behavior for the stock details page (`/stocks/[ticker]`) and shared top navigation controls visible on that page.

## UX Principles
- Preserve current visual design and layout.
- Prioritize immediate feedback on user actions.
- Keep state resilient under missing auth and partial data.
- Use progressive disclosure: quick action first, deep drill-down on demand.

## Primary User Goals
1. Understand whether a stock is attractive now.
2. Switch timeframe quickly.
3. Save/remove stock from portfolio/watchlist.
4. Drill into peers, news, and financial statements.
5. Navigate to adjacent workflows (search, watchlist, settings).

## Control-by-Control Behavior

### Sidebar navigation
- Dashboard, Top Stocks, Search, Watchlist, Settings route directly.
- Active page highlight remains as currently styled.

### Topbar search
- Enter submits to `/search?q=<term>`.
- Empty submit routes to `/search`.

### Topbar bell
- Opens alerts workflow by routing to watchlist.
- Rationale: watchlist is current home for actionable alerts.

### Topbar moon
- Routes to display settings (`/settings?panel=display`).
- Rationale: avoids silent no-op and gives explicit destination.

### Topbar profile
- Routes to profile/settings (`/settings?panel=profile`).

### Price range tabs (1D/1W/1M/1Y/ALL)
- Updates local state + query string (`?range=`).
- Refetches stock details payload for selected range.
- Active tab always reflects current range.

### Add to Portfolio
- If no configured user id:
  - Route to Settings (preview-mode path).
- If user id exists:
  - Toggle watchlist membership.
  - Label states:
    - `Add to Portfolio` (not in watchlist)
    - `In Portfolio` (already in watchlist)
    - `Saving...` (mutation pending)

### Full Financial Statements
- Routes to `/stocks/[ticker]/financials`.
- Provides clear drill-down path from summary metrics.

### Peer ticker click
- Ticker symbol routes to `/stocks/[peerTicker]`.
- Supports comparison loop without extra navigation friction.

### News title click
- If `url` exists, open in new tab.
- If no `url`, title remains static text.

## Empty/Error/Preview UX

### Missing stock details data
- Render fallback content (existing design-safe defaults).
- No layout collapse.

### Missing user context
- Watchlist CTA routes to settings rather than failing silently.

### Partial blocks (news/insider/highlights)
- Render available subset.
- Use fallback text when data is absent.

## Backend/Hook Dependencies

### Read hooks
- `useStockDetails` for full details payload.
- `useStockWatchlistStatus` for CTA state.
- Optional `useStockQuote` for tighter quote pulse.

### Mutation hooks
- `useStockWatchlistActions` for add/remove.

### Event invalidation
- `market:quotes-updated` invalidates relevant stock details queries.

## Metrics to Track (recommended)
- Range tab click rate by symbol.
- Add-to-portfolio conversion and undo/remove rate.
- Peer-to-peer navigation rate.
- News click-through rate.
- Financial statements drill-down rate.
