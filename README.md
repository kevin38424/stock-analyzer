# Stock Value Screener Boilerplate

A lightweight Next.js + Supabase starter for a stock screening app that ranks top-500 companies using a custom scoring model.

## Included
- Next.js App Router starter
- Tailwind setup
- Supabase schema
- Scoring engine boilerplate
- Search, analyze, top-stocks, and watchlist route handlers
- Product and technical docs
- Project standards and memory docs

## UI Architecture
- UI code follows a feature-module pattern in `src/features/`
- Each feature exposes a public API via `src/features/<feature>/index.ts`
- Route files in `src/app/` should import from feature public APIs

## Server vs UI Boundaries
- HTTP route handlers live in `src/app/api/` and should stay thin.
- Server-only API/business logic lives in `src/server/`.
- Shared pure utilities (safe for both UI/server) live in `src/lib/`.

## Run locally
1. Copy `.env.example` to `.env.local`
2. Fill in Supabase and provider keys
3. Install dependencies
4. Run the dev server

```bash
npm install
npm run dev
```

## Live Market Data Integration
- The app is DB-first for reads and uses provider sync for freshness.
- Unified Tradier REST/stream client lives in `src/server/tradier/client.ts`.
- Quote freshness sync lives in `src/server/market-data/quote-sync.ts`.
- Tradier provider integration lives in `src/server/market-data/providers/tradier-provider.ts`.
- Optional on-demand quote refresh endpoint: `GET /api/market/quotes?symbols=AAPL,MSFT`.
- Optional market status endpoint (clock/calendar-backed): `GET /api/market/status`.

Set these vars in `.env.local`:

```bash
MARKET_DATA_PROVIDER=tradier
TRADIER_API_TOKEN=...
TRADIER_BASE_URL=https://api.tradier.com/v1
MARKET_DATA_MAX_QUOTE_AGE_SECONDS=60
TRADIER_QUOTES_POST_THRESHOLD=40
TRADIER_SEARCH_FALLBACK_ENABLED=false
```

The app still falls back to mock page payloads if Supabase is not configured.

## New Stock Details API (Mock-backed)
- Endpoint: `GET /api/stocks/:ticker/details?range=1M`
- Contract types: `src/features/stocks/types/stock-details.ts`
- Hook/data integration plan: `docs/stock-details-hook-plan.md`
