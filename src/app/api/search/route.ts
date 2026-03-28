import { NextRequest } from "next/server";
import { parseQueryParams, queryParamsWithDefaults } from "@/server/http/parsing";
import { badRequest, ok } from "@/server/http/response";
import { getRequestUserId } from "@/server/http/request-context";
import { getSearchResultsLive } from "@/server/search/get-search-results-live";
import { searchQuerySchema } from "@/server/search/search-schemas";
import { getEmptySearchResponse } from "@/lib/search/get-search-results";

export async function GET(request: NextRequest) {
  const requestUserId = getRequestUserId(request, request.nextUrl.searchParams.get("userId"));
  const parsed = parseQueryParams(request, searchQuerySchema, (params) => ({
    ...queryParamsWithDefaults(params, {
      q: "",
      category: "all",
      limit: "25",
      includeTrending: "true",
    }),
    userId: requestUserId,
  }));

  if (!parsed) {
    return badRequest("Invalid query parameter.");
  }

  if (!parsed.q) {
    return ok(getEmptySearchResponse(""));
  }

  const data = await getSearchResultsLive({
    query: parsed.q,
    category: parsed.category,
    limit: parsed.limit,
    includeTrending: parsed.includeTrending,
  });

  return ok(data);
}
