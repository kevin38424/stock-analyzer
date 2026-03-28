# Homepage UX Button Behavior Spec

This document defines expected behavior for every interactive control on the homepage, with API/data dependencies and implementation notes.

## UX Intent
- Homepage is a command center: every visible control should either navigate to deeper detail, toggle contextual UI, or mutate watchlist state.
- Actions should preserve layout/design fidelity while adding functional behavior behind existing controls.
- Frontend should remain API-only: page components call hooks, hooks call app API routes.

## Data Sources Used on Homepage
- Primary source: `GET /api/home` via `useHomeDashboard`.
- Search suggestions in quick-add modal: existing search flow via `useSearchResults` (app API path).
- Watchlist add action: existing watchlist mutation hook (`useCreateWatchlistItem`) (app API path).

## Button Inventory and Expected Behavior

| Area | Control | UX Behavior | Data/Side Effects | Status |
|---|---|---|---|---|
| Sidebar | Dashboard | Navigate to `/` | Route only | Implemented |
| Sidebar | Top Stocks | Navigate to `/top-stocks` | Route only | Implemented |
| Sidebar | Search | Navigate to `/search` | Route only | Implemented |
| Sidebar | Watchlist | Navigate to `/watchlist` | Route only | Implemented |
| Sidebar | Settings | Navigate to `/settings` | Route only | Implemented |
| Topbar | Search submit | Navigate to `/search?q=<query>` (preserve additional params) | Route only | Implemented |
| Topbar | Alerts bell | Open/collapse in-page alerts panel | Reads `watchlistPreview` from home payload | Implemented |
| Topbar | Theme icon | Toggle focus mode (non-destructive visual toggle) | Local UI state only | Implemented |
| Topbar | Profile | Navigate to `/settings` | Route only | Implemented |
| Hero | Explore Top 500 | Navigate to `/top-stocks` | Route only | Implemented |
| Hero | View Sector Report | Navigate to `/top-stocks?sector=all&valuationStyle=value` | Route only | Implemented |
| Top Stocks card | View Full Ranking | Navigate to `/top-stocks` | Route only | Implemented |
| Top Stocks table | Ticker chip/company row | Navigate to `/stocks/:ticker` | Route only | Implemented |
| Sector card | Info icon | Toggle explanatory helper text | Local UI state only | Implemented |
| Watchlist card | Plus icon | Open “Add Stock To Watchlist” modal | Local state + search query hook | Implemented |
| Watchlist card | Each row | Navigate to `/stocks/:ticker` | Route only | Implemented |
| Watchlist card | View Full Watchlist | Navigate to `/watchlist` | Route only | Implemented |
| Watchlist floating action | Message icon | Open right-side Insight Assistant panel | Local UI state only | Implemented |
| Add Watchlist modal | Suggestion row | Select ticker into form | Local UI state only | Implemented |
| Add Watchlist modal | Cancel/Close | Close modal; keep page state intact | Local UI state only | Implemented |
| Add Watchlist modal | Add To Watchlist | Create item then invalidate dashboard/watchlist queries | Mutation + cache invalidation | Implemented |
| Insight panel | Close | Close panel | Local UI state only | Implemented |
| Insight panel | Ticker quick actions | Navigate to `/stocks/:ticker` | Route only | Implemented |

## UX States Required
- Alerts panel:
  - Closed by default.
  - Opens from bell click and can be dismissed with close control.
  - Shows up to top 3 watchlist movements; shows friendly empty message when none.
- Add Watchlist modal:
  - Disabled submit until ticker selected.
  - Search suggestions appear for `q.length > 1`.
  - Shows mutation error inline without collapsing modal.
  - On success: closes modal, resets fields, invalidates `home-dashboard` and `watchlist-page`.
- Insight panel:
  - Opens from message FAB.
  - Supports quick drilldown to stock detail pages.

## API/Hook Integration Guardrails
- Homepage UI reads dashboard data only from `useHomeDashboard`.
- `useHomeDashboard` remains API-only (`GET /api/home`), no direct Supabase/Tradier in UI.
- Query key stability: `['home-dashboard', userId ?? null, includeWatchlist]`.
- Polling defaults to 15s (can be overridden by hook option).

## Test Guardrails (Not Overly Strict)
- Keep tests stable on behavior, not pixel styling.
- Required checks:
  - Homepage sections render from API payload/fallback.
  - CTA and navigation controls render as links/buttons.
  - Modal open/close path works.
  - Add action handles success/error state transitions.
- Avoid fragile tests asserting exact class lists or spacing.

## Future Enhancements
- Replace local focus-mode behavior with global theme preference once design system is finalized.
- Replace demo watchlist user id with authenticated session user id.
- Attach analytics events to high-value actions:
  - `home_cta_explore_top_500_click`
  - `home_watchlist_add_open`
  - `home_watchlist_add_submit`
  - `home_insight_panel_open`
