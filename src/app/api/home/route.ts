import { NextRequest } from "next/server";
import { homeQuerySchema } from "@/server/home/home-schemas";
import { parseQueryParams, queryParamsWithDefaults } from "@/server/http/parsing";
import { badRequest, ok } from "@/server/http/response";
import { getRequestUserId } from "@/server/http/request-context";
import { getHomeDashboardDataLive } from "@/server/home/get-home-dashboard-data-live";

export async function GET(request: NextRequest) {
  const requestUserId = getRequestUserId(request, request.nextUrl.searchParams.get("userId"));
  const parsed = parseQueryParams(request, homeQuerySchema, (params) => ({
    ...queryParamsWithDefaults(params, {
      includeWatchlist: "true",
    }),
    userId: requestUserId,
  }));

  if (!parsed) {
    return badRequest("Invalid query parameters.");
  }

  const data = await getHomeDashboardDataLive({
    includeWatchlist: parsed.includeWatchlist,
    userId: parsed.userId,
  });

  return ok(data);
}
