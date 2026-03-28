# Project Memory

## Product Intent
This application helps users identify potentially undervalued top-500 stocks using a custom weighted score.

## Stack Decision
- Frontend hosting: Vercel
- Backend/data layer: Supabase
- Minimal infrastructure is a design goal

## Scoring Weights
- Valuation: 30
- Profitability: 20
- Growth: 20
- Financial Health: 15
- Momentum: 10
- Sentiment: 5

## Product Constraints
- Users can search for companies and add favorites
- There should be a section for top buy ideas
- Buy ideas should only come from the top-500 universe
- The scoring engine should use custom logic, not just raw provider ratings
