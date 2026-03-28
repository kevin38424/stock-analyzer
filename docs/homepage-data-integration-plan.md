# Home Page Data Integration Plan

## Objective
Define the data contracts and storage model for the new home dashboard so UI components can be connected to live APIs without redesigning the page structure.

## What Data Is Shown On The Home Page

## 1) Sidebar + Top Navigation
- Product brand, user profile, nav state, notifications indicator.
- Data sources:
  - Auth provider (`auth.users`) for profile.
  - `user_watchlist_alerts` count for alert badge.

## 2) Hero Section
- Static marketing copy + CTA labels.
- Data source: currently static content.
- Optional future source: CMS/config table for A/B tests.

## 3) KPI Cards (5 cards)
- `Stocks analyzed`: universe coverage count and day-over-day delta.
- `Strong Buys`: count and share of universe.
- `Avg Score`: average of latest composite scores.
- `Most Improved`: ticker with highest day-over-day score delta.
- `Watchlist Alerts`: unresolved alerts count for user.
- Data sources:
  - `market_daily_summary`
  - `top_stock_rankings_daily`
  - `user_watchlist_alerts`

## 4) Top Stocks To Buy Table
- Rank, company, score, recommendation, live/latest price.
- Data sources:
  - `top_stock_rankings_daily` (rank + recommendation + score + delta)
  - `companies` (ticker/name/sector)
  - `stock_quotes_latest` (price + change)

## 5) Watchlist Preview Rail
- User-specific watchlist rows with score signal and price move.
- Data sources:
  - `user_favorites`
  - `companies`
  - `stock_scores`
  - `stock_quotes_latest`

## 6) Sector Performance
- Top sectors and daily change%.
- Data source:
  - `sector_performance_daily`

## 7) Score Distribution
- Histogram bins for total score distribution (0-100).
- Data source:
  - `score_distribution_daily`

## 8) Pro Insight
- One generated insight blurb.
- Suggested source:
  - `market_daily_summary` + rule-generated text, or
  - future `daily_insights` table from LLM pipeline.

## API Design (Implemented + Recommended)

## Implemented routes
- `GET /api/home`
  - Returns a typed aggregate response for entire dashboard.
  - Query:
    - `includeWatchlist` (boolean, default `true`)
  - Implementation:
    - [app/api/home/route.ts](/Users/kparkj/Desktop/KPL/03_education/02_projects/stock-app/app/api/home/route.ts)
    - [lib/home/get-home-dashboard-data.ts](/Users/kparkj/Desktop/KPL/03_education/02_projects/stock-app/lib/home/get-home-dashboard-data.ts)
    - [types/home/dashboard.ts](/Users/kparkj/Desktop/KPL/03_education/02_projects/stock-app/types/home/dashboard.ts)

- `GET /api/top-stocks?limit=25`
  - Added `limit` validation (`1-100`) for easy pagination rollout.
  - Implementation:
    - [app/api/top-stocks/route.ts](/Users/kparkj/Desktop/KPL/03_education/02_projects/stock-app/app/api/top-stocks/route.ts)

- `POST /api/watchlist`
  - Added Zod validation and `companyId` support.
  - Implementation:
    - [app/api/watchlist/route.ts](/Users/kparkj/Desktop/KPL/03_education/02_projects/stock-app/app/api/watchlist/route.ts)

## Recommended next routes
- `GET /api/watchlist/preview` (auth-required, no client userId).
- `GET /api/sector-performance?date=YYYY-MM-DD`.
- `GET /api/score-distribution?date=YYYY-MM-DD`.
- `GET /api/alerts/count`.

## Database Changes (Applied)
Updated schema in [supabase/schema.sql](/Users/kparkj/Desktop/KPL/03_education/02_projects/stock-app/supabase/schema.sql):

- `user_favorites`
  - Added optional `company_id` FK for stronger joins.
  - Added unique index `(user_id, company_id)` when company_id exists.

- Added `stock_quotes_latest`
  - Latest quote snapshot per company for price/change rendering.

- Added `top_stock_rankings_daily`
  - Daily rank table powering top-stocks section and trend deltas.

- Added `market_daily_summary`
  - Precomputed KPI block for home cards.

- Added `sector_performance_daily`
  - Daily sector return summary.

- Added `score_distribution_daily`
  - Histogram bins to render score distribution chart quickly.

- Added `user_watchlist_alerts`
  - User-level alert feed with RLS policies.

## Data Pipeline Plan

## Daily batch (pre-market or market close)
1. Refresh top-500 universe in `companies`.
2. Pull raw metrics into `stock_metrics_raw`.
3. Compute composite score into `stock_scores`.
4. Snapshot daily rank into `top_stock_rankings_daily`.
5. Aggregate KPI summary into `market_daily_summary`.
6. Aggregate sector and histogram tables.

## Intraday batch (every 1-5 min)
1. Refresh `stock_quotes_latest`.
2. Re-evaluate alert rules and insert into `user_watchlist_alerts`.

## API serving strategy
- Home route should mostly read precomputed daily tables + latest quotes.
- Avoid heavy recomputation in request path.
- Keep route handlers thin and deterministic.

## Mapping UI Components To API Fields
- KPI cards:
  - `kpis.stocksAnalyzed`
  - `kpis.stocksAnalyzedDelta`
  - `kpis.strongBuys`
  - `kpis.strongBuysPercent`
  - `kpis.averageScore`
  - `kpis.mostImprovedTicker`
  - `kpis.mostImprovedDeltaScore`
  - `kpis.watchlistAlerts`
- Top table: `topStocks[]`
- Watchlist rail: `watchlistPreview[]`
- Sector panel: `sectorPerformance[]`
- Distribution panel: `scoreDistribution[]`
- Pro insight: `insight`

## Important Integration Notes
- Keep UI bound to one typed response (`HomeDashboardResponse`) to minimize prop churn.
- Use precomputed tables for top-level cards/charts; reserve raw metrics for detail pages.
- Prefer `company_id` joins over ticker text matching.
- For production auth, replace client-provided `userId` in watchlist APIs with session user from Supabase auth.
