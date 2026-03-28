import { NextRequest } from "next/server";
import { parseQueryParams, queryParamsWithDefaults } from "@/server/http/parsing";
import { badRequest, ok } from "@/server/http/response";
import { getRequestUserId } from "@/server/http/request-context";
import { getTopStocksPageData } from "@/server/top-stocks/get-top-stocks-page-data";
import { topStocksQuerySchema } from "@/server/top-stocks/top-stocks-schemas";

export async function GET(request: NextRequest) {
  const requestUserId = getRequestUserId(request, request.nextUrl.searchParams.get("userId"));
  const parsed = parseQueryParams(request, topStocksQuerySchema, (params) => ({
    ...queryParamsWithDefaults(params, {
      limit: "25",
      offset: "0",
      favoritesOnly: "false",
      minScore: "0",
      maxScore: "100",
      sector: "all",
      valuationStyle: "growth",
    }),
    userId: requestUserId,
  }));

  if (!parsed) {
    return badRequest("Invalid query parameters for top stocks request.");
  }

  if (parsed.minScore > parsed.maxScore) {
    return badRequest("Invalid score range: minScore cannot be greater than maxScore.");
  }

  const payload = await getTopStocksPageData(parsed);

  // Keep legacy top-level `results` for transition safety.
  return ok({
    ...payload,
    results: payload.rows.map((row) => ({
      ticker: row.ticker,
      companyName: row.companyName,
      sector: row.sector,
      analysis: {
        total: row.score,
        recommendation: row.recommendation,
      },
    })),
  });
}
