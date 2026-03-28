# Database and API Redesign (Final Canonical Model)

## Decision summary
The database has been finalized around one rule:
- Store canonical facts.
- Derive read models for API/UI.

Because this environment has no existing production data, the schema was cleaned in-place to the final model (no legacy compatibility layer, no migration staging in SQL).

## Canonical vs derived

## Canonical (stored)
- Company identity + metadata: `companies`, `company_profiles`
- Raw ingest snapshots: `stock_metrics_raw`, `financial_metric_snapshots`, `analyst_consensus_snapshots`, `insider_transactions`, `company_news`
- Market time-series facts: `stock_price_history_daily`, `stock_quotes_latest`, `stock_technicals_daily`
- Scoring snapshots: `stock_scores_daily`, `stock_factor_scores_daily`
- Ranking snapshots: `top_stock_rankings_daily`, `top_stock_rank_insights_daily`, `stock_highlights_daily`
- Dashboard aggregates: `market_daily_summary`, `sector_performance_daily`, `score_distribution_daily`
- Ingestion control/observability: `market_data_sync_runs`, `market_stream_state`
- User intent: `user_favorites`, `user_watchlist_alerts`
- Settings/account state: `user_profiles`, `user_subscriptions`, `user_preferences`, `user_security_state`, `user_api_tokens`

## Derived (read models)
- `v_company_quotes_latest`: latest price, previous close, and `% change`
- `v_stock_scores_latest`: latest scoring snapshot per company
- `v_top_stock_cards_latest`: API projection for top-stocks page
- `v_watchlist_rows_latest`: API projection for watchlist page
- `v_user_settings_snapshot`: settings/profile/subscription/security summary projection
- `v_company_quotes_latest` now includes quote freshness metadata:
  - `live_fetched_at`
  - `quote_age_seconds`
  - `is_stale`

## Explicit removals
- Removed legacy score tables from schema design:
  - `stock_scores`
  - `stock_score_history`
- All score reads now come from `stock_scores_daily` via `v_stock_scores_latest`.

## Key schema outcomes
1. `user_favorites` is canonical by `(user_id, company_id)`.
2. Ticker/company display data for APIs is derived from `companies` in views.
3. Ranking uniqueness is scoped by `(as_of_date, valuation_style, rank/company_id)`.
4. Score and price quality is protected by table-level constraints.
5. Read-heavy endpoint shapes are provided by SQL views, reducing route complexity.
6. Domain enums enforce consistent values for valuation style, recommendation, watchlist segment, and subscription state.
7. `updated_at` trigger policy centralizes mutation timestamps for consistency and auditability.
8. `user_favorites.ticker` is auto-synced from `company_id` via trigger (no write-path drift).

## API design outcomes

## Write API behavior
- `POST /api/watchlist`
  - Resolves `ticker/companyId` to canonical company.
  - Mutates by `company_id`.
  - Persists user intent fields only (`segment`, `thesis`, timestamps) + ticker cache.
- `PATCH /api/watchlist`
  - Resolves ticker/company id and updates by `company_id`.
- `DELETE /api/watchlist`
  - Resolves ticker/company id and deletes by `company_id`.
- `PATCH /api/settings`
  - Uses true partial update semantics (only provided keys are updated; no null-overwrite of omitted settings).

## Read API behavior
- `GET /api/home` reads from aggregate + derived views.
- `GET /api/top-stocks` reads from `v_top_stock_cards_latest`.
- `GET /api/watchlist` reads from `v_watchlist_rows_latest`.
- `GET /api/settings` reads from canonical settings tables and derived counters.
- `GET /api/market/quotes?symbols=AAPL,MSFT&maxAgeSeconds=60`
  - DB-first quote read, with stale quote refresh through provider sync.
  - writes through to `stock_quotes_latest`.
  - logs run metadata to `market_data_sync_runs`.

## Live data execution model (Tradier-ready)
1. API read paths call `ensureFreshQuotesForTickers(...)`.
2. The sync service loads known quotes from `stock_quotes_latest`.
3. If quote is stale/missing, provider fetch is executed for only stale symbols.
4. Fresh quotes are upserted; APIs read from canonical DB rows (not provider payload directly).
5. Sync outcomes are tracked in `market_data_sync_runs` for ops visibility.

## WebSocket stream architecture (single session rule)
- Tradier allows one stream session per account, so stream state is centralized in `market_stream_state` (singleton table).
- Stream worker lifecycle:
  1. Create session via `POST /markets/events/session`.
  2. Connect to `wss://ws.tradier.com/v1/markets/events`.
  3. Send subscribe payload with `sessionid` and symbol set.
  4. Upsert incremental quote updates into `stock_quotes_latest`.
  5. Keep `market_stream_state.status`, session timing, and heartbeat updated.
- Horizontal scale rule:
  - Exactly one active stream worker should hold the session at any point.
  - Other app replicas stay read-only and depend on DB canonical quotes.

## Settings Page Mapping (Stored vs Derived)

## Stored fields
- Profile card:
  - `fullName`, `email`, `region`, `timezone` from `user_profiles`
- Plan card:
  - `plan`, `status`, `billingInterval`, `currentPeriodEnd` from `user_subscriptions`
- Display + notifications toggles:
  - from `user_preferences`
- Security baseline:
  - `mfaEnabled`, `lastPasswordChangedAt` from `user_security_state`
- API token records:
  - individual token rows in `user_api_tokens` (`token_name`, `token_hash`, scope, revoke/expiry)

## Derived fields
- `activeTokens`:
  - derived count of non-revoked/non-expired rows in `user_api_tokens`
- `lastPasswordUpdate` label like `62 days ago`:
  - derived from `lastPasswordChangedAt`
- `activeSessions`:
  - should be derived from auth/session provider data (not persisted in app tables)

## Why this scales better
1. Stable write path: no denormalized client payload dependencies.
2. Fast reads: pre-shaped SQL projections with focused indexes.
3. Lower drift risk: one source of truth for scores/identity.
4. Easier ingestion evolution: raw tables and canonical snapshots are isolated from API contracts.
