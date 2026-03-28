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
- UI code follows a feature-module pattern in `features/`
- Each feature exposes a public API via `features/<feature>/index.ts`
- Route files in `app/` should import from feature public APIs

## Run locally
1. Copy `.env.example` to `.env.local`
2. Fill in Supabase and provider keys
3. Install dependencies
4. Run the dev server

```bash
npm install
npm run dev
```

## Important
This project currently uses mock market data in `lib/mock-data.ts`. Replace that with your live provider integration before production use.

## New Stock Details API (Mock-backed)
- Endpoint: `GET /api/stocks/:ticker/details?range=1M`
- Contract types: `types/stock-details.ts`
- Data integration plan: `docs/stock-details-data-plan.md`
