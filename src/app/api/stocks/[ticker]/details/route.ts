import { NextRequest } from "next/server";
import { parseQueryParams, queryParamsWithDefaults } from "@/server/http/parsing";
import { badRequest, notFound, ok } from "@/server/http/response";
import { stockDetailsQuerySchema } from "@/server/stocks/stocks-schemas";
import { getStockDetailsDataLive } from "@/server/stocks/get-stock-details-data-live";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await context.params;
  const parsed = parseQueryParams(request, stockDetailsQuerySchema, (params) =>
    queryParamsWithDefaults(params, { range: "1M" }),
  );

  if (!parsed) {
    return badRequest("Invalid query parameter: range must be one of 1D, 1W, 1M, 1Y, ALL.");
  }

  const details = await getStockDetailsDataLive({
    ticker: ticker.toUpperCase(),
    range: parsed.range,
  });

  if (!details) {
    return notFound("Ticker not found.");
  }

  return ok(details);
}
