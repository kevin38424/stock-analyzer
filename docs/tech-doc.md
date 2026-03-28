# Technical Design

## Goal
Build a lightweight stock analysis app with Next.js on Vercel and Supabase as the main backend. The app helps users identify potentially undervalued top-500 stocks using a custom 0-100 scoring engine.

## Architecture
- Web: Next.js App Router deployed on Vercel
- Backend: Vercel route handlers for search, analysis, top stocks, and watchlist writes
- Database: Supabase Postgres
- Auth: Supabase Auth
- Scheduling: Vercel Cron or Supabase scheduled jobs for daily top-500 refresh
- External Providers: one financial market data provider + one news/sentiment provider

## Main User Flows
1. Search a company by ticker or name
2. View score breakdown and explanation
3. Add stock to favorites
4. Browse the "great stocks to buy" list within the top-500 universe

## Data Flow
### Search
Client -> `/api/search` -> external provider -> filtered results -> client

### Analyze ticker
Client -> `/api/analyze/[ticker]` -> check cached metrics -> fetch/refresh if stale -> compute score -> return analysis

### Top stocks
Daily job -> fetch top-500 metrics -> compute scores -> upsert `stock_scores` -> UI reads top-ranked rows

### Favorites
Client -> `/api/watchlist` -> Supabase insert into `user_favorites`

## Scoring Framework
Weights:
- Valuation: 30%
- Profitability: 20%
- Growth: 20%
- Financial Health: 15%
- Momentum: 10%
- Sentiment: 5%

Each raw metric is normalized to 0-100 before aggregation.

## Caching Strategy
- Top 500 rankings: precomputed daily
- Company analysis page: use cached data if under 24 hours old
- Search: stateless live lookup with lightweight filtering

## Security
- Never expose service role key to the browser
- Use Row Level Security for user tables
- Validate all route inputs with Zod
- Add per-route rate limiting before production launch

## Suggested Next Steps
1. Replace mock provider logic with live APIs
2. Add sector-relative normalization tables
3. Add score history and daily snapshots
4. Add auth-aware watchlist pages
5. Add tests for scoring edge cases
