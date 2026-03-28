# Project Standards

## Engineering Principles
- Keep business rules explicit and testable
- Prefer simple serverless patterns over extra infrastructure
- Separate raw market data from derived scores
- Every score must be explainable to the user
- Optimize for maintainability before optimization complexity

## Code Standards
- Use TypeScript strict mode
- Validate request payloads with Zod
- Keep route handlers thin; move logic into `lib/`
- Prefer pure functions for scoring logic
- Avoid magic numbers in business logic unless documented
- Use named types for every external API response

## File/Folder Standards
- `src/app/` for routes and pages
- `src/app/api/` for Next.js route handlers only (HTTP adapter layer)
- `src/features/` for UI feature modules (react-bulletproof style)
- Keep feature internals private; expose UI via `src/features/<feature>/index.ts`
- Route pages should import from feature public APIs, not deep paths
- `src/server/` for server-only business logic, repositories, and API helpers
- `src/lib/` for shared pure utilities/models that can be consumed by both UI and server code
- `src/types/` for shared cross-feature/domain models only
- Feature-specific models should live in `src/features/<feature>/types/`
- `docs/` for technical and business documents
- `supabase/` for SQL and policies

## Data Standards
- Store timestamps in UTC
- Separate raw metrics from normalized scores
- Record source provider and fetch time for market data
- Keep score history for explainability and trend charts

## Product Rules
- Only recommend stocks inside the top-500 universe
- Show disclaimer that output is research support, not financial advice
- Do not show a stock as "great to buy" if required metrics are missing
- Penalize incomplete data rather than silently ignoring it

## Pull Request Standards
- Include problem statement and approach
- Add screenshots for UI changes
- Add tests for scoring logic changes
- Update docs when changing weights, thresholds, or product rules

## Testing Standards
- Unit test every scoring category
- Add edge-case tests for missing and extreme values
- Add integration tests for API routes with mocked providers
- Add basic UI smoke tests for search, favorites, and top-stocks pages
